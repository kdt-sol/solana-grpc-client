export class BaseError extends Error {
    protected withValue(key: string, value?: any): this {
        if (value !== undefined) {
            Object.defineProperty(this, key, { value, writable: false, enumerable: true, configurable: true })
        }

        return this
    }
}
