# @kdt-sol/solana-grpc-client

<div align="center">

![Solana gRPC Client](https://img.shields.io/badge/Solana-gRPC%20Client-blueviolet?style=for-the-badge&logo=solana)

[![npm version](https://img.shields.io/npm/v/@kdt-sol/solana-grpc-client.svg?style=flat-square)](https://www.npmjs.com/package/@kdt-sol/solana-grpc-client) [![Build Status](https://img.shields.io/github/workflow/status/kdt-sol/solana-grpc-client/CI?style=flat-square)](https://github.com/kdt-sol/solana-grpc-client/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![npm downloads](https://img.shields.io/npm/dm/@kdt-sol/solana-grpc-client.svg?style=flat-square)](https://www.npmjs.com/package/@kdt-sol/solana-grpc-client) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

</div>

A modern TypeScript library for connecting to and interacting with various Solana GRPC services like YellowStone Geyser GRPC and Orbit JetStream. Built on top of gRPC-js with full ESM support and CommonJS compatibility.

## ✨ Key Features

- 🔄 **Streaming API** - Full support for bidirectional, client-streaming, and server-streaming data flows
- 🔌 **Multiple Services** - Support for both YellowStone Geyser GRPC and Orbit JetStream
- 📦 **Dual Format** - Supports both ESM and CommonJS
- 🛡️ **TypeScript First** - Complete type definitions and excellent IDE experience
- ⚡ **High Performance** - Optimized for performance with efficient stream processing
- 🔐 **Security** - Support for TLS connections and token authentication

## 📦 Installation

### 🔧 Requirements

- Node.js 18.0.0 or higher
- Protocol Buffers compiler version 3 (protoc) if you need to regenerate code from protobuf

### 📥 Package Installation

```bash
# With npm
npm install @kdt-sol/solana-grpc-client

# With yarn
yarn add @kdt-sol/solana-grpc-client

# With pnpm
pnpm add @kdt-sol/solana-grpc-client
```

### 📤 Import Options

```typescript
// Import the entire library
import * as solanaGrpcClient from '@kdt-sol/solana-grpc-client'

// Import specific clients
import { yellowstone, jetstream } from '@kdt-sol/solana-grpc-client'

// Import specific modules directly
import * as yellowstone from '@kdt-sol/solana-grpc-client/yellowstone'
import * as jetstream from '@kdt-sol/solana-grpc-client/jetstream'

// Alternative paths
import * as yellowstone from '@kdt-sol/solana-grpc-client/clients/yellowstone'
import * as jetstream from '@kdt-sol/solana-grpc-client/clients/jetstream'

// CommonJS
const { yellowstone, jetstream } = require('@kdt-sol/solana-grpc-client')
```

## 🚀 Usage Guide

### YellowStone Geyser GRPC

```typescript
import { yellowstone } from '@kdt-sol/solana-grpc-client'

async function main() {
    // Create client connecting to Yellowstone Geyser GRPC endpoint
    const client = new yellowstone.YellowstoneGeyserClient('https://your-yellowstone-endpoint.com', {
        token: 'your-auth-token', // Optional
    })

    // Get version information
    const version = await client.getVersion({})
    console.log('Yellowstone version:', version)

    // Get current slot
    const slotResponse = await client.getSlot({})
    console.log('Current slot:', slotResponse.slot)

    // Subscribe to updates
    const stream = await client.subscribe()

    // Process updates from stream
    for await (const update of stream) {
        console.log('Received update:', update)

        // Process update based on type
        if (update.accountInfo) {
            console.log('Account update:', update.accountInfo)
        } else if (update.slot) {
            console.log('Slot update:', update.slot)
        }

        // You can write data back to the stream if needed
        // This is useful for bidirectional communication
        await stream.write({
            ping: { id: 123 }, // Example: sending a ping request
        })
    }
}

main().catch(console.error)
```

### Orbit JetStream

```typescript
import { jetstream } from '@kdt-sol/solana-grpc-client'

async function main() {
    // Create client connecting to Orbit JetStream endpoint
    const client = new jetstream.OrbitJetstreamClient('https://your-jetstream-endpoint.com')

    // Check connection with ping
    const pong = await client.ping({})
    console.log('Ping successful:', pong)

    // Subscribe to updates
    const stream = await client.subscribe()

    // Process updates from stream
    for await (const update of stream) {
        console.log('Received JetStream update:', update)

        // Process update based on type
        // ...

        // Send data back to the server if needed
        await stream.write({
            // Your request data here according to the protocol
        })
    }
}

main().catch(console.error)
```

### Error Handling and Resubscription

```typescript
import { errors, yellowstone } from '@kdt-sol/solana-grpc-client'

async function main() {
    try {
        const client = new yellowstone.YellowstoneGeyserClient('https://your-yellowstone-endpoint.com')
        await client.getVersion({})
    } catch (error) {
        if (error instanceof errors.ConnectionError) {
            console.error('Unable to connect to endpoint:', error.message)
        } else if (error instanceof errors.BaseError) {
            console.error('Client error:', error.message)
        } else {
            console.error('Unknown error:', error)
        }
    }
}

// Example of auto-reconnection with exponential backoff
async function subscribeWithReconnection() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-yellowstone-endpoint.com')

    let retryCount = 0
    const maxRetries = 5
    const baseDelay = 1000 // 1 second initial delay

    while (retryCount <= maxRetries) {
        try {
            console.log(`Attempting to subscribe (attempt ${retryCount + 1})`)
            const stream = await client.subscribe()

            // Reset retry count on successful connection
            retryCount = 0

            try {
                // Process stream data
                for await (const update of stream) {
                    console.log('Received update:', update)
                }
            } catch (streamError) {
                console.error('Stream error:', streamError)
                // If stream fails, we'll retry from the outer loop
                throw streamError
            }
        } catch (error) {
            retryCount++
            if (retryCount > maxRetries) {
                console.error('Max retries reached, giving up')
                throw error
            }

            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, retryCount - 1) * (0.5 + Math.random() * 0.5)
            console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
    }
}

main().catch(console.error)
subscribeWithReconnection().catch(console.error)
```

### Advanced Configuration

```typescript
import { yellowstone } from '@kdt-sol/solana-grpc-client'

// Create client with custom options
const client = new yellowstone.YellowstoneGeyserClient('https://your-yellowstone-endpoint.com', {
    // Authentication options
    'token': 'your-auth-token',
    'tokenMetadataKey': 'x-custom-auth-header',

    // gRPC options
    'grpc.max_receive_message_length': 1024 * 1024 * 100, // 100MB
    'grpc.keepalive_time_ms': 30000,

    // Stream options
    'receiveTimeout': 120000,
    'endTimeout': 5000,
    'drainTimeout': 5000,
    'autoEnd': true,

    // Custom metadata
    'metadata': {
        'client-name': 'my-awesome-app',
        'client-version': '1.0.0',
    },
})
```

### Writing Data to Stream

```typescript
import { yellowstone } from '@kdt-sol/solana-grpc-client'

async function main() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-yellowstone-endpoint.com')

    // Subscribe to stream
    const stream = await client.subscribe()

    // Setting up filters for accounts
    await stream.write({
        accounts: {
            accountIds: [Buffer.from('YourSolanaPublicKey', 'base64')],
        },
    })

    // You can send additional requests during the stream's lifetime
    setTimeout(async () => {
        await stream.write({
            ping: { id: Date.now() }, // Send a ping to keep connection alive
        })
    }, 30000)

    // Process incoming messages
    for await (const update of stream) {
        console.log('Received:', update)
    }
}

main().catch(console.error)
```

## 📚 API Documentation

### Clients

- **YellowstoneGeyserClient**: Client for YellowStone Geyser GRPC API

    - `subscribe()`: Subscribe to updates from the blockchain
    - `getLatestBlockhash(request)`: Get the latest blockhash
    - `getBlockHeight(request)`: Get the current block height
    - `getSlot(request)`: Get the current slot
    - `isBlockhashValid(request)`: Check if a blockhash is valid
    - `getVersion(request)`: Get version information
    - `ping(request)`: Check connection

- **OrbitJetstreamClient**: Client for Orbit JetStream API
    - `subscribe()`: Subscribe to updates from JetStream
    - `ping(request)`: Check connection
    - `getVersion(request)`: Get version information

### Utilities

- **Stream Management**: Utilities for handling gRPC data streams

    - `DuplexStreamIterator`: Class for handling bidirectional streams easily with async iterator
    - `StreamIterator`: Base class for unidirectional streams

- **Error Handling**: Specialized error classes
    - `BaseError`: Base error class
    - `ConnectionError`: Connection error
    - `ParseUrlError`: URL parsing error
    - `InvalidInputError`: Invalid input error
    - `MessageDecodingError`: Message decoding error

Detailed API documentation can be found by examining the TypeScript definitions in the source code.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please see the contribution process below:

### Contribution Process

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Local Development

```bash
# Clone repo
git clone https://github.com/kdt-sol/solana-grpc-client.git
cd solana-grpc-client

# Install dependencies
pnpm install

# Generate code from proto files
pnpm run proto:generate

# Build the project
pnpm run build

# Check for errors
pnpm run lint
pnpm run typecheck
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Diep Dang - [@kdt310722](https://github.com/kdt310722) - kdt310722@gmail.com

Project Link: [https://github.com/kdt-sol/solana-grpc-client](https://github.com/kdt-sol/solana-grpc-client)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/kdt310722">Diep Dang</a></sub>
</div>
