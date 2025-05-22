import { createDeferred, withTimeout } from '@kdt310722/utils/promise'
import type { ClientDuplexStream, ClientReadableStream } from '@grpc/grpc-js'
import type { Constructor } from '@kdt310722/utils/common'
import { DuplexStreamIterator, type DuplexStreamIteratorOptions } from './duplex-stream-iterator'
import { StreamIterator, type StreamIteratorOptions } from './stream-iterator'

export interface BaseCreateStreamIteratorOptions {
    metadataTimeout?: number
}

export type CreateStreamIteratorOptions<TResponse, TData> = StreamIteratorOptions<TResponse, TData> & BaseCreateStreamIteratorOptions

export async function createStreamIterator<TResponse, TData, TIterator extends StreamIterator<TResponse, TData>, TStream extends ClientReadableStream<TResponse>, TStreamOptions extends CreateStreamIteratorOptions<TResponse, TData>>(iterator: Constructor<TIterator>, subscribe: () => Promise<TStream> | TStream, options?: TStreamOptions): Promise<TIterator> {
    const subscribed = createDeferred<void>()
    const stream = await subscribe()

    const handleError = (error: Error) => {
        if (!subscribed.isSettled) {
            subscribed.reject(error)
        }
    }

    const handleMetadata = () => {
        if (!subscribed.isSettled) {
            subscribed.resolve()
        }
    }

    stream.on('error', handleError)
    stream.on('metadata', handleMetadata)

    return withTimeout(subscribed, options?.metadataTimeout ?? 10_000, 'Timed out when waiting for stream metadata').then(() => new iterator(stream, options)).finally(() => {
        stream.removeListener('error', handleError)
        stream.removeListener('metadata', handleMetadata)

        if (!subscribed.isSettled) {
            subscribed.resolve()
        }
    })
}

export async function createReadableStream<TResponse, TData = TResponse>(subscribe: () => Promise<ClientReadableStream<TResponse>> | ClientReadableStream<TResponse>, options?: CreateStreamIteratorOptions<TResponse, TData>) {
    return createStreamIterator<TResponse, TData, StreamIterator<TResponse, TData>, ClientReadableStream<TResponse>, StreamIteratorOptions<TResponse, TData>>(StreamIterator, subscribe, options)
}

export type CreateDuplexStreamIteratorOptions<TResponse, TData> = DuplexStreamIteratorOptions<TResponse, TData> & BaseCreateStreamIteratorOptions

export async function createDuplexStreamIterator<TRequest, TResponse, TData = TResponse>(subscribe: () => Promise<ClientDuplexStream<TRequest, TResponse>> | ClientDuplexStream<TRequest, TResponse>, options?: CreateDuplexStreamIteratorOptions<TResponse, TData>) {
    return createStreamIterator<TResponse, TData, DuplexStreamIterator<TRequest, TResponse, TData>, ClientDuplexStream<TRequest, TResponse>, DuplexStreamIteratorOptions<TResponse, TData>>(DuplexStreamIterator, subscribe, options)
}
