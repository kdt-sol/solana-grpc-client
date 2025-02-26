export interface ParsedUrl {
    host: string
    port: number
    isInsecure: boolean
}

export function parseUrl(input: string): ParsedUrl {
    const { protocol, hostname, port: rawPort } = new URL(input)

    if (protocol !== 'http:' && protocol !== 'https:') {
        throw new Error(`Invalid protocol: ${protocol.slice(0, -1)}`)
    }

    const isInsecure = protocol === 'http:'
    const port = rawPort.length === 0 ? (isInsecure ? 80 : 443) : Number(rawPort)

    return { host: hostname, port, isInsecure }
}
