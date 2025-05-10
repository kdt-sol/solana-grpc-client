import { BaseError } from './base-error'

export class ParseUrlError extends BaseError {
    public declare url?: string

    public withUrl(url?: string) {
        return this.withValue('url', url)
    }
}
