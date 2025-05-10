import { BaseError } from './base-error'

export class InvalidInputError extends BaseError {
    public declare inputName?: string
    public declare inputValue?: unknown

    public withInputName(name?: string): this {
        return this.withValue('inputName', name)
    }

    public withInputValue(value?: unknown): this {
        return this.withValue('inputValue', value)
    }
}
