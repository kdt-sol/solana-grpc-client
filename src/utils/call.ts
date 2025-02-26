import type { ClientUnaryCall, Metadata, ServiceError } from '@grpc/grpc-js'
import { notNullish } from '@kdt310722/utils/common'
import { createMetadata } from './metadatas'

export type UnaryCallback<TResponse> = (error: ServiceError | null, response: TResponse) => void

export type UnaryMethod<TRequest, TResponse> = (request: TRequest, metadata: Metadata, callback: UnaryCallback<TResponse>) => ClientUnaryCall

export const call = <TRequest, TResponse>(method: UnaryMethod<TRequest, TResponse>, request: TRequest, metadata?: Metadata): Promise<TResponse> => new Promise((resolve, reject) => {
    method(request, metadata ?? createMetadata(), (error, response) => (notNullish(error) ? reject(error) : resolve(response)))
})
