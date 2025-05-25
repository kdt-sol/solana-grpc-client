import { type CreateGrpcClientOptions, type DuplexStreamIteratorOptions, createDuplexStreamIterator, createGrpcClient } from '../../utils'
import { ARPCServiceClient, type SubscribeResponse } from './generated/arpc'

export type CorvusArpcClientOptions = CreateGrpcClientOptions & DuplexStreamIteratorOptions<SubscribeResponse, SubscribeResponse>

export class CorvusArpcClient {
    protected readonly grpc: ARPCServiceClient

    public constructor(url: string, protected readonly options?: CorvusArpcClientOptions) {
        this.grpc = createGrpcClient(ARPCServiceClient, url, options)
    }

    public async subscribe() {
        return createDuplexStreamIterator(() => this.grpc.subscribe(), this.options)
    }
}
