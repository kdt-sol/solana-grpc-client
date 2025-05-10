import type { Metadata } from '@grpc/grpc-js'
import { type CreateGrpcClientOptions, type DuplexStreamIteratorOptions, call, createDuplexStreamIterator, createGrpcClient } from '../../utils'
import { type GetVersionRequest, type GetVersionResponse, JetstreamClient, type PingRequest, type PongResponse, type SubscribeUpdate } from './generated/jetstream'

export type OrbitJetstreamClientOptions = CreateGrpcClientOptions & DuplexStreamIteratorOptions<SubscribeUpdate, SubscribeUpdate>

export class OrbitJetstreamClient {
    protected readonly grpc: JetstreamClient

    public constructor(url: string, protected readonly options?: OrbitJetstreamClientOptions) {
        this.grpc = createGrpcClient(JetstreamClient, url, options)
    }

    public async subscribe() {
        return createDuplexStreamIterator(() => this.grpc.subscribe(), this.options)
    }

    public async ping(request: PingRequest, metadata?: Metadata) {
        return call<PingRequest, PongResponse>(this.grpc.ping.bind(this.grpc), request, metadata)
    }

    public async getVersion(request: GetVersionRequest, metadata?: Metadata) {
        return call<GetVersionRequest, GetVersionResponse>(this.grpc.getVersion.bind(this.grpc), request, metadata)
    }
}
