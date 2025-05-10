import { ParseUrlError } from '../errors'

export function isValidPort(port: number) {
    return port >= 0 && port <= 65_535
}

export interface ParsedUrl {
    host: string
    port: number
    isInsecure: boolean
}

export function parseUrl(input: string): ParsedUrl {
    try {
        const { protocol, hostname, port: rawPort, href } = new URL(input)

        if (hostname.length === 0) {
            throw new ParseUrlError('Invalid hostname').withUrl(href)
        }

        if (protocol !== 'http:' && protocol !== 'https:') {
            throw new ParseUrlError(`Invalid protocol: ${protocol.slice(0, -1)}`).withUrl(href)
        }

        const isInsecure = protocol === 'http:'
        const port = rawPort.length === 0 ? (isInsecure ? 80 : 443) : Number(rawPort)

        if (!isValidPort(port)) {
            throw new ParseUrlError(`Invalid port: ${port}`).withUrl(href)
        }

        return { host: hostname, port, isInsecure }
    } catch (error) {
        if (error instanceof ParseUrlError) {
            throw error
        }

        throw new ParseUrlError('Invalid URL').withUrl(input)
    }
}
