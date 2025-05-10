import type { Metadata } from '@grpc/grpc-js'
import { isUndefined } from '@kdt310722/utils/common'
import type { BinaryReader } from '@bufbuild/protobuf/wire'
import { type CreateGrpcClientOptions, StreamIterator, type StreamIteratorOptions, createGrpcClient } from './utils'
import { EventPublisherClient, type StreamResponse } from './proto/generated/publisher'
import { Empty } from './proto/generated/google/protobuf/empty'
import { MessageWrapper } from './proto/generated/events'
import { THOR_MAX_ADDRESSES_PER_SUBSCRIPTION } from './constants'
import { InvalidInputError, MessageDecodingError } from './errors'

export interface ThorStreamClientOptions extends CreateGrpcClientOptions {
    maxWalletAddresses?: number
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
    public readonly grpc: EventPublisherClient
    public readonly maxWalletAddresses: number

    public constructor(url: string, { maxWalletAddresses = THOR_MAX_ADDRESSES_PER_SUBSCRIPTION, ...clientOptions }: ThorStreamClientOptions = {}) {
        this.maxWalletAddresses = maxWalletAddresses
        this.grpc = createGrpcClient(EventPublisherClient, url, clientOptions)
    }

    public subscribeTransactions(options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToTransactions', request: Empty, dataFormatter: this.getDataFormatter('transaction'), ...options })
    }

    public subscribeAccountUpdates(options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToAccountUpdates', request: Empty, dataFormatter: this.getDataFormatter('account'), ...options })
    }

    public subscribeSlotStatus(options: SubscribeOptions = {}) {
        return this.subscribe({ method: 'subscribeToSlotStatus', request: Empty, dataFormatter: this.getDataFormatter('slot'), ...options })
    }

    public subscribeWalletTransactions(addresses: string[], options: SubscribeOptions = {}) {
        if (addresses.length === 0 || addresses.length > this.maxWalletAddresses) {
            throw new InvalidInputError(`Number of wallet addresses must be between 1 and ${this.maxWalletAddresses}. Received: ${addresses.length}`).withInputName('addresses').withInputValue(addresses.length)
        }

        return this.subscribe({ method: 'subscribeToWalletTransactions', request: { walletAddress: addresses }, dataFormatter: this.getDataFormatter('transaction'), ...options })
    }

    protected subscribe<TMethod extends SubscribeMethod, TData>({ method, request, metadata, dataFormatter, ...options }: SubscribeParams<TMethod, TData>) {
        return new StreamIterator(this.grpc[method](request as any, metadata), { ...options, dataFormatter: ({ data }: StreamResponse) => dataFormatter.decode(data) })
    }

    protected getDataFormatter<TResult extends ReturnType<typeof MessageWrapper['decode']>, TKey extends keyof TResult>(key: TKey) {
        const decode = (data: Buffer) => {
            const result = MessageWrapper.decode(data)

            if (isUndefined(result[key as string])) {
                throw new MessageDecodingError(`Failed to decode message: key '${String(key)}' not found in MessageWrapper.`).withRawData(data).withExpectedType(`MessageWrapper with key '${String(key)}'`)
            }

            return result[key as string] as NonNullable<TResult[TKey]>
        }

        return { decode }
    }
}
