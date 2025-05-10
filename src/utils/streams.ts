import { createDeferred } from '@kdt310722/utils/promise'
import type { ClientDuplexStream } from '@grpc/grpc-js'
import { DuplexStreamIterator, type DuplexStreamIteratorOptions } from './duplex-stream-iterator'

export async function createDuplexStreamIterator<TRequest, TResponse, TData = TResponse>(subscribe: () => Promise<ClientDuplexStream<TRequest, TResponse>> | ClientDuplexStream<TRequest, TResponse>, options?: DuplexStreamIteratorOptions<TResponse, TData>) {
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

    return subscribed.then(() => new DuplexStreamIterator<TRequest, TResponse, TData>(stream, options)).finally(() => {
        stream.removeListener('error', handleError)
        stream.removeListener('metadata', handleMetadata)
    })
}
