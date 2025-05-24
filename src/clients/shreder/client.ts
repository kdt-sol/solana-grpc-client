import type { Metadata } from '@grpc/grpc-js'
import { type CreateDuplexStreamIteratorOptions, type CreateGrpcClientOptions, type CreateStreamIteratorOptions, createDuplexStreamIterator, createGrpcClient, createReadableStream } from '../../utils'
import { type Entry, ShrederServiceClient, type SubscribeEntriesRequest, type SubscribeTransactionsRequest, type SubscribeTransactionsResponse } from './generated/shredstream'

export type ShrederClientOptions = CreateGrpcClientOptions

export class ShrederClient {
    protected readonly grpc: ShrederServiceClient

    public constructor(url: string, options: ShrederClientOptions = {}) {
        this.grpc = createGrpcClient(ShrederServiceClient, url, options)
    }

    public async subscribeEntries(request: SubscribeEntriesRequest, metadata?: Metadata, options?: CreateStreamIteratorOptions<Entry, Entry>) {
        return createReadableStream<Entry>(() => this.grpc.subscribeEntries(request, metadata), options)
    }

    public async subscribeTransactions(options?: CreateDuplexStreamIteratorOptions<SubscribeTransactionsResponse, SubscribeTransactionsResponse>) {
        return createDuplexStreamIterator<SubscribeTransactionsRequest, SubscribeTransactionsResponse>(() => this.grpc.subscribeTransactions(), options)
    }
}
