import { BaseError } from './base-error'

export class ConnectionError extends BaseError {
    public declare address?: string

    public withAddress(address?: string): this {
        return this.withValue('address', address)
    }
}
