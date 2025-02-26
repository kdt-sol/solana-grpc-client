import type { ChannelOptions, Metadata } from '@grpc/grpc-js'
import { notNullish } from '@kdt310722/utils/common'
import type { BinaryReader } from '@bufbuild/protobuf/wire'
import { type MetadataObject, StreamIterator, type StreamIteratorOptions, createCredential, createMetadataInterceptor, parseUrl } from './utils'
import { EventPublisherClient, type StreamResponse } from './proto/generated/publisher'
import { Empty } from './proto/generated/google/protobuf/empty'
import { SlotStatusEvent, TransactionEvent, UpdateAccountEvent } from './proto/generated/events'

export interface ThorStreamClientOptions extends ChannelOptions {
    token?: string
    metadata?: MetadataObject
}

export interface SubscribeOptions extends Omit<StreamIteratorOptions<unknown, unknown>, 'dataFormatter'> {
    metadata?: Metadata
}

export type SubscribeMethod = { [K in keyof EventPublisherClient]: K extends `subscribeTo${string}` ? K : never }[keyof EventPublisherClient]

interface MessageFns<T> {
    decode(input: BinaryReader | Uint8Array, length?: number): T
}

export interface SubscribeParams<TMethod extends SubscribeMethod, TData> extends SubscribeOptions {
    method: TMethod
    request: NonNullable<Parameters<EventPublisherClient[TMethod]>[0]>
    dataFormatter: MessageFns<TData>
}

export class ThorStreamClient {
    public readonly address: string
    public readonly grpc: EventPublisherClient

    public constructor(url: string, options: ThorStreamClientOptions = {}) {
        const { metadata = {}, token, ...channelOptions } = options
        const { host, port, isInsecure } = parseUrl(url)
        const interceptor = createMetadataInterceptor({ ...(notNullish(token) ? { authorization: token } : {}), ...metadata })

        this.address = `${host}:${port}`
        this.grpc = new EventPublisherClient(this.address, createCredential(isInsecure), { ...channelOptions, interceptors: [interceptor] })
    }

    public subscribeTransactions(options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToTransactions', request: Empty, dataFormatter: TransactionEvent, ...options })
    }

    public subscribeAccountUpdates(options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToAccountUpdates', request: Empty, dataFormatter: UpdateAccountEvent, ...options })
    }

    public subscribeSlotStatus(options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToSlotStatus', request: Empty, dataFormatter: SlotStatusEvent, ...options })
    }

    public subscribeWalletTransactions(addresses: string[], options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToWalletTransactions', request: { walletAddress: addresses }, dataFormatter: TransactionEvent, ...options })
    }

    protected subscribe<TMethod extends SubscribeMethod, TData>({ method, request, metadata, dataFormatter, ...options }: SubscribeParams<TMethod, TData>) {
        return new StreamIterator(this.grpc[method](request as any, metadata), { ...options, dataFormatter: ({ data }: StreamResponse) => dataFormatter.decode(data) })
    }
}
