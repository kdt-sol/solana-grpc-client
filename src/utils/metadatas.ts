import { InterceptingCall, type Interceptor, Metadata, type MetadataValue } from '@grpc/grpc-js'
import { wrap } from '@kdt310722/utils/array'

export type MetadataObject = Record<string, MetadataValue | MetadataValue[]>

export function addMetadata(metadata: Metadata, input: MetadataObject) {
    for (const [key, value] of Object.entries(input)) {
        for (const v of wrap(value)) {
            metadata.add(key, v)
        }
    }

    return metadata
}

export function createMetadata(metadata: MetadataObject = {}) {
    return addMetadata(new Metadata(), metadata)
}

export const createMetadataInterceptor = (metadata: MetadataObject): Interceptor => (options, nextCall) => new InterceptingCall(nextCall(options), {
    start: (m, listener, next) => next(addMetadata(m, metadata), listener),
})
