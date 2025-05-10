import type { SubscribeRequest } from './generated/geyser'

export const createSubscribeRequest = (request: Partial<SubscribeRequest>): SubscribeRequest => ({
    accounts: {},
    slots: {},
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
    accountsDataSlice: [],
    ...request,
})
