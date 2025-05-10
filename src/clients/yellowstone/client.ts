import type { Metadata } from '@grpc/grpc-js'
import { type CreateGrpcClientOptions, type DuplexStreamIteratorOptions, call, createDuplexStreamIterator, createGrpcClient } from '../../utils'
import { type GetBlockHeightRequest, type GetBlockHeightResponse, type GetLatestBlockhashRequest, type GetLatestBlockhashResponse, type GetSlotRequest, type GetSlotResponse, type GetVersionRequest, type GetVersionResponse, GeyserClient, type IsBlockhashValidRequest, type IsBlockhashValidResponse, type PingRequest, type PongResponse, type SubscribeReplayInfoRequest, type SubscribeReplayInfoResponse, type SubscribeUpdate } from './generated/geyser'

export type YellowstoneGeyserClientOptions = CreateGrpcClientOptions & DuplexStreamIteratorOptions<SubscribeUpdate, SubscribeUpdate>

export class YellowstoneGeyserClient {
    protected readonly grpc: GeyserClient

    public constructor(url: string, protected readonly options: YellowstoneGeyserClientOptions = {}) {
        this.grpc = createGrpcClient(GeyserClient, url, { tokenMetadataKey: 'x-token', ...options })
    }

    public async subscribe() {
        return createDuplexStreamIterator(() => this.grpc.subscribe(), this.options)
    }

    public async subscribeReplayInfo(request: SubscribeReplayInfoRequest, metadata?: Metadata) {
        return call<SubscribeReplayInfoRequest, SubscribeReplayInfoResponse>(this.grpc.subscribeReplayInfo.bind(this.grpc), request, metadata)
    }

    public async ping(request: PingRequest, metadata?: Metadata) {
        return call<PingRequest, PongResponse>(this.grpc.ping.bind(this.grpc), request, metadata)
    }

    public async getLatestBlockhash(request: GetLatestBlockhashRequest, metadata?: Metadata) {
        return call<GetLatestBlockhashRequest, GetLatestBlockhashResponse>(this.grpc.getLatestBlockhash.bind(this.grpc), request, metadata)
    }

    public async getBlockHeight(request: GetBlockHeightRequest, metadata?: Metadata) {
        return call<GetBlockHeightRequest, GetBlockHeightResponse>(this.grpc.getBlockHeight.bind(this.grpc), request, metadata)
    }

    public async getSlot(request: GetSlotRequest, metadata?: Metadata) {
        return call<GetSlotRequest, GetSlotResponse>(this.grpc.getSlot.bind(this.grpc), request, metadata)
    }

    public async isBlockhashValid(request: IsBlockhashValidRequest, metadata?: Metadata) {
        return call<IsBlockhashValidRequest, IsBlockhashValidResponse>(this.grpc.isBlockhashValid.bind(this.grpc), request, metadata)
    }

    public async getVersion(request: GetVersionRequest, metadata?: Metadata) {
        return call<GetVersionRequest, GetVersionResponse>(this.grpc.getVersion.bind(this.grpc), request, metadata)
    }
}
