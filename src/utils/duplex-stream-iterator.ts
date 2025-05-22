import type { ClientDuplexStream } from '@grpc/grpc-js'
import { createDeferred, withTimeout } from '@kdt310722/utils/promise'
import { isNullish, notNullish } from '@kdt310722/utils/common'
import { StreamIterator, type StreamIteratorOptions } from './stream-iterator'

export interface DuplexStreamIteratorOptions<TResponse, TData> extends StreamIteratorOptions<TResponse, TData> {
    autoEnd?: boolean
    endTimeout?: number
    drainTimeout?: number
}

export class DuplexStreamIterator<TRequest, TResponse, TData = TResponse> extends StreamIterator<TResponse, TData> {
    protected readonly duplexStream: ClientDuplexStream<TRequest, TResponse>
    protected readonly autoEnd: boolean
    protected readonly endTimeout: number
    protected readonly drainTimeout: number

    public constructor(
        stream: ClientDuplexStream<TRequest, TResponse>,
        {
            autoEnd = true,
            endTimeout = 5000,
            drainTimeout = 5000,
            ...options
        }: DuplexStreamIteratorOptions<TResponse, TData> = {},
    ) {
        super(stream, options)

        this.duplexStream = stream
        this.autoEnd = autoEnd
        this.endTimeout = endTimeout
        this.drainTimeout = drainTimeout
    }

    public isWritable() {
        return !this.duplexStream.writableEnded && this.duplexStream.writable
    }

    public async write(data: TRequest) {
        await this.waitForWritable()

        if (!this.isWritable()) {
            throw new Error('The stream is not writable')
        }

        const wrote = createDeferred<void>()

        const handleError = (error: unknown) => {
            if (!wrote.isSettled) {
                wrote.reject(error)
            }
        }

        this.duplexStream.once('error', handleError)

        this.duplexStream.write(data, (error?: Error) => {
            if (notNullish(error)) {
                wrote.reject(error)
            } else {
                wrote.resolve()
            }
        })

        return wrote.finally(() => {
            this.duplexStream.removeListener('error', handleError)
        })
    }

    public async waitForWritable() {
        if (this.isWritable()) {
            return
        }

        const writable = createDeferred<void>()

        const handleDrain = () => {
            writable.resolve()
        }

        this.duplexStream.once('drain', handleDrain)

        return withTimeout(
            writable,
            this.drainTimeout,
            'Timed out while waiting for the stream to become writable',
        ).finally(() => {
            this.duplexStream.removeListener('drain', handleDrain)
        })
    }

    public async end(data?: TRequest) {
        const ended = createDeferred<void>()

        try {
            if (isNullish(data)) {
                this.duplexStream.end()
                ended.resolve()
            } else {
                this.duplexStream.end(data, () => ended.resolve())
            }
        } catch (error) {
            ended.reject(error)
        }

        return withTimeout(ended, this.endTimeout, 'Timed out while waiting for the stream to end')
    }

    public override async close() {
        if (this.isWritable() && this.autoEnd) {
            await this.end()
        }

        return super.close()
    }
}
