import { BaseError } from './base-error'

export class MessageDecodingError extends BaseError {
    public declare rawData?: Buffer
    public declare expectedType?: string

    public withRawData(data?: Buffer): this {
        return this.withValue('rawData', data)
    }

    public withExpectedType(type?: string): this {
        return this.withValue('expectedType', type)
    }
}
