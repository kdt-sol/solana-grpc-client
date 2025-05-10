import type { ChannelOptions, Client } from '@grpc/grpc-js'
import { type Constructor, notNullish } from '@kdt310722/utils/common'
import { isString } from '@kdt310722/utils/string'
import { type ParsedUrl, parseUrl } from './urls'
import { type MetadataObject, createMetadataInterceptor } from './metadatas'
import { createCredential } from './credentials'

export interface CreateGrpcClientOptions extends ChannelOptions {
    token?: string
    tokenMetadataKey?: string
    metadata?: MetadataObject
}

export function createGrpcClient<TClient extends Client>(client: Constructor<TClient>, url: ParsedUrl | string, { token, tokenMetadataKey, metadata, ...options }: CreateGrpcClientOptions = {}): TClient & { address: string } {
    const { host, port, isInsecure } = isString(url) ? parseUrl(url) : url
    const interceptor = createMetadataInterceptor({ ...(notNullish(token) && notNullish(tokenMetadataKey) ? { [tokenMetadataKey]: token } : {}), ...metadata })
    const address = `${host}:${port}`

    return Object.assign(new client(address, createCredential(isInsecure), { ...options, interceptors: [interceptor] }), { address })
}
