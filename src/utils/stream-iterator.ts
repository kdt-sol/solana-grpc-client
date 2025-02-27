import type { ClientReadableStream } from '@grpc/grpc-js'
import { type Fn, tap } from '@kdt310722/utils/function'
import { notNullish } from '@kdt310722/utils/common'
import { isString } from '@kdt310722/utils/string'

export const ERROR_RESULT = Symbol('ERROR_RESULT')

export interface ErrorResult {
    type: typeof ERROR_RESULT
    error: unknown
}

export interface StreamIteratorOptions<TResponse, TData> {
    maxQueueSize?: number
    dataFormatter?: (data: TResponse) => TData
    signal?: AbortSignal
}

export class StreamIterator<TResponse, TData = TResponse> implements AsyncIterableIterator<TData> {
    protected readonly maxQueueSize: number
    protected readonly signal?: AbortSignal
    protected readonly dataFormatter: (data: TResponse) => TData

    protected readonly resolvers: Array<(result: ErrorResult | IteratorResult<TData>) => void> = []
    protected readonly messageQueue: TData[] = []
    protected readonly eventListeners: Record<string, Fn> = {}

    protected abortEventListener?: Fn
    protected error?: unknown

    public constructor(protected readonly stream: ClientReadableStream<TResponse>, { maxQueueSize = 1000, dataFormatter, signal }: StreamIteratorOptions<TResponse, TData> = {}) {
        this.maxQueueSize = maxQueueSize
        this.dataFormatter = dataFormatter ?? ((data) => data as unknown as TData)
        this.signal = signal

        if (!stream.readable) {
            throw new Error('The stream is not readable')
        }

        this.registerEventHandlers()
    }

    public [Symbol.asyncIterator]() {
        return this
    }

    public close() {
        try {
            this.stream.cancel()
        } catch {
            this.stream.destroy()
        }
    }

    public async next(): Promise<IteratorResult<TData>> {
        if (this.signal?.aborted) {
            return this.throw(this.createAbortError())
        }

        if (notNullish(this.error)) {
            return this.throw(this.error)
        }

        if (!this.stream.readable) {
            return this.return()
        }

        if (this.messageQueue.length > 0) {
            const value = this.messageQueue.shift()!

            if (this.stream.isPaused() && this.messageQueue.length < this.maxQueueSize) {
                this.stream.resume()
            }

            return { done: false, value }
        }

        const data = await new Promise<ErrorResult | IteratorResult<TData>>((resolve) => this.resolvers.push(resolve))

        if (this.isErrorResult(data)) {
            return this.throw(data.error)
        }

        if (data.done) {
            return this.return(data.value)
        }

        return data
    }

    public async return(value?: TData): Promise<IteratorResult<TData>> {
        this.close()
        this.messageQueue.length = 0
        this.resolvers.length = 0

        for (const [event, listener] of Object.entries(this.eventListeners)) {
            this.stream.off(event, listener)
        }

        if (this.abortEventListener) {
            this.signal?.removeEventListener('abort', this.abortEventListener)
        }

        return Promise.resolve().then(() => ({ done: true, value }))
    }

    public async throw(error: unknown): Promise<IteratorResult<TData>> {
        await this.return()
        throw error
    }

    protected handleData(data: TResponse) {
        const value = this.dataFormatter(data)

        if (this.resolvers.length > 0) {
            this.resolve({ done: false, value })
        } else {
            if (this.messageQueue.length >= this.maxQueueSize) {
                this.stream.pause()
            }

            this.messageQueue.push(value)
        }
    }

    protected handleError(error: unknown) {
        if (this.isCancelledError(error)) {
            this.done()
        } else {
            this.done({ type: ERROR_RESULT, error: (this.error = error) })
        }
    }

    protected handleClose() {
        this.done()
    }

    protected handleEnd() {
        this.close()
    }

    protected handleAbort() {
        this.handleError(this.createAbortError())
    }

    protected done(error?: ErrorResult) {
        const result = notNullish(error) ? error : <const>{ done: true, value: undefined }
        const resolvers = [...this.resolvers]

        this.resolvers.length = 0

        for (const resolve of resolvers) {
            resolve(result)
        }
    }

    protected resolve(result: ErrorResult | IteratorResult<TData>) {
        this.resolvers.shift()?.(result)
    }

    protected createAbortError() {
        return tap(Object.assign(new Error('The operation was aborted'), { reason: this.signal?.reason }), (error) => (error.name = 'AbortError'))
    }

    protected isCancelledError(error: unknown) {
        return error instanceof Error && 'details' in error && isString(error.details) && error.details.includes('Cancelled')
    }

    protected isErrorResult(result: ErrorResult | IteratorResult<TData>): result is ErrorResult {
        return 'type' in result && result.type === ERROR_RESULT
    }

    protected registerEventHandlers() {
        if (this.signal?.aborted) {
            throw this.createAbortError()
        }

        this.signal?.addEventListener('abort', this.abortEventListener = () => this.handleAbort())
        this.stream.on('data', this.eventListeners['data'] = (data: TResponse) => this.handleData(data))
        this.stream.on('error', this.eventListeners['error'] = (error: unknown) => this.handleError(error))
        this.stream.on('end', this.eventListeners['end'] = () => this.handleEnd())
        this.stream.on('finish', this.eventListeners['finish'] = () => this.handleEnd())
        this.stream.on('close', this.eventListeners['close'] = () => this.handleClose())
    }
}
