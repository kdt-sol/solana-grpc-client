import type { ClientReadableStream, Metadata } from '@grpc/grpc-js'
import { type CreateGrpcClientOptions, type CreateStreamIteratorOptions, createGrpcClient, createReadableStream } from '../../utils'
import { EMPTY_METADATA } from '../../constants'
import { EventPublisherClient, type StreamResponse, type SubscribeWalletRequest } from './generated/publisher'
import { Empty } from './generated/google/protobuf/empty'
import { SlotStatusEvent, TransactionEvent, UpdateAccountEvent } from './generated/events'

export const EMPTY_REQUEST = Empty.create()

export type ThorStreamerClientOptions = CreateGrpcClientOptions & CreateStreamIteratorOptions<StreamResponse, StreamResponse>

export class ThorStreamerClient {
    protected readonly grpc: EventPublisherClient

    public constructor(url: string, protected readonly options: ThorStreamerClientOptions = {}) {
        this.grpc = createGrpcClient(EventPublisherClient, url, { tokenMetadataKey: 'authorization', ...options })
    }

    public async subscribeToTransactions(metadata?: Metadata) {
        return this.createStream<Empty, StreamResponse, TransactionEvent>(this.grpc.subscribeToTransactions.bind(this.grpc), EMPTY_REQUEST, this.parseTransactionEvent.bind(this), metadata)
    }

    public async subscribeToAccountUpdates(metadata?: Metadata) {
        return this.createStream<Empty, StreamResponse, UpdateAccountEvent>(this.grpc.subscribeToAccountUpdates.bind(this.grpc), EMPTY_REQUEST, this.parseAccountUpdateEvent.bind(this), metadata)
    }

    public async subscribeToSlotStatus(metadata?: Metadata) {
        return this.createStream<Empty, StreamResponse, SlotStatusEvent>(this.grpc.subscribeToSlotStatus.bind(this.grpc), EMPTY_REQUEST, this.parseSlotStatusEvent.bind(this), metadata)
    }

    public async subscribeToWalletTransactions(walletAddresses: string[], metadata?: Metadata) {
        const request: SubscribeWalletRequest = {
            walletAddress: walletAddresses,
        }

        return this.createStream<SubscribeWalletRequest, StreamResponse, TransactionEvent>(this.grpc.subscribeToWalletTransactions.bind(this.grpc), request, this.parseTransactionEvent.bind(this), metadata)
    }

    protected parseTransactionEvent(response: StreamResponse) {
        return TransactionEvent.decode(response.data)
    }

    protected parseAccountUpdateEvent(response: StreamResponse) {
        return UpdateAccountEvent.decode(response.data)
    }

    protected parseSlotStatusEvent(response: StreamResponse) {
        return SlotStatusEvent.decode(response.data)
    }

    protected createStream<TRequest, TResponse = StreamResponse, TResult = TResponse>(method: (request: TRequest, metadata?: Metadata) => ClientReadableStream<TResponse>, request: TRequest, dataFormatter?: (data: TResponse) => TResult, metadata?: Metadata) {
        return createReadableStream<TResponse, TResult>(() => method.call(this.grpc, request, metadata ?? EMPTY_METADATA), { ...this.options, dataFormatter })
    }
}
