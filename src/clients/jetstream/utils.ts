import type { SubscribeRequest } from './generated/jetstream'

export const createSubscribeRequest = (request: Partial<SubscribeRequest>): SubscribeRequest => ({
    accounts: {},
    transactions: {},
    ...request,
})
