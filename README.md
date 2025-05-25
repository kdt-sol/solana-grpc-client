# @kdt-sol/solana-grpc-client

<div align="center">
  <img src="https://img.shields.io/badge/Solana-gRPC-9945FF?style=for-the-badge&logo=solana" alt="Solana gRPC" />
  <img src="https://img.shields.io/npm/v/@kdt-sol/solana-grpc-client?style=for-the-badge" alt="NPM Version" />
  <img src="https://img.shields.io/npm/dt/@kdt-sol/solana-grpc-client?style=for-the-badge" alt="NPM Downloads" />
  <img src="https://img.shields.io/github/license/kdt-sol/solana-grpc-client?style=for-the-badge" alt="License" />
</div>

<div align="center">
  <h3>🚀 High-Performance TypeScript Client for Solana gRPC Services</h3>
  <p>Enterprise-grade streaming client supporting YellowStone Geyser, Orbit JetStream, ThorStreamer, Shreder ShredStream, and Corvus ARPC APIs</p>
</div>

---

## ✨ Features

### 🎯 **Multi-Provider Support**
- **YellowStone Geyser**: Full-featured Solana data streaming with account/transaction/block subscriptions
- **Orbit JetStream**: High-performance transaction streaming and block data access
- **ThorStreamer**: Real-time account updates, slot status, and wallet transaction monitoring
- **Shreder ShredStream**: Raw block entries and filtered transaction streaming
- **Corvus ARPC**: Advanced transaction filtering and monitoring via Aurifex network

### ⚡ **Advanced Streaming**
- **Bidirectional Streams**: Full duplex communication with async iterator support
- **Connection Management**: Auto-reconnection, heartbeat monitoring, graceful degradation
- **Stream Utilities**: Built-in `StreamIterator` and `DuplexStreamIterator` classes
- **Backpressure Handling**: Smart flow control and memory management

### 🛡️ **Enterprise Ready**
- **TypeScript First**: Full type safety with generated proto definitions
- **Error Handling**: Comprehensive error hierarchy with context preservation
- **Authentication**: Token-based auth with custom metadata support
- **Performance**: Optimized for high-throughput real-time applications

### 🔧 **Developer Experience**
- **ESM & CJS**: Dual module support for maximum compatibility
- **Zero Config**: Works out-of-the-box with sensible defaults
- **Extensible**: Plugin architecture for custom middleware
- **Well Documented**: Complete API reference with practical examples

---

## 📦 Installation

### Using PNPM (Recommended)
```bash
pnpm add @kdt-sol/solana-grpc-client
```

### Using NPM
```bash
npm install @kdt-sol/solana-grpc-client
```

### Using Yarn
```bash
yarn add @kdt-sol/solana-grpc-client
```

### Troubleshooting Installation

**Node.js Version**: Requires Node.js 18+ with ESM support
```bash
node --version  # Should be v18.0.0 or higher
```

**gRPC Dependencies**: If you encounter native module issues:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For Apple Silicon Macs
export GRPC_PYTHON_BUILD_SYSTEM_OPENSSL=1
npm install
```

---

## 🚀 Quick Start

### Basic Usage - YellowStone Geyser

```typescript
import { yellowstone } from '@kdt-sol/solana-grpc-client'

async function main() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-yellowstone-endpoint.com')

    // Subscribe to account updates
    const stream = await client.subscribe()

    // Send subscription request
    await stream.write({
        accounts: {
            'solana-accounts': {
                account: ['*'],
                owner: ['11111111111111111111111111111112'], // System Program
                filters: [],
            },
        },
    })

    // Process real-time updates
    for await (const update of stream) {
        if (update.account) {
            console.log('Account update:', {
                pubkey: update.account.account?.pubkey,
                lamports: update.account.account?.lamports,
                owner: update.account.account?.owner,
            })
        }
    }
}

main().catch(console.error)
```

### Basic Usage - JetStream

```typescript
import { jetstream } from '@kdt-sol/solana-grpc-client'

async function main() {
    const client = new jetstream.OrbitJetstreamClient('https://your-jetstream-endpoint.com')

    // Subscribe to transaction stream
    const stream = await client.subscribe({
        accounts: ['YourTargetPubkey'],
        commitment: 1, // Confirmed
    })

    for await (const message of stream) {
        if (message.transaction) {
            console.log('Transaction:', {
                signature: message.transaction.signature,
                slot: message.transaction.slot,
                accounts: message.transaction.transaction?.message?.accountKeys,
            })
        }
    }
}

main().catch(console.error)
```

---

## 📖 API Reference

### YellowstoneGeyserClient

Complete client for YellowStone Geyser gRPC API providing comprehensive Solana blockchain data access.

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `subscribe()` | Subscribe to real-time blockchain updates | None | `DuplexStreamIterator` |
| `subscribeReplayInfo(request)` | Get blockchain replay information | `SubscribeReplayInfoRequest` | `StreamIterator` |
| `ping(request)` | Test connection with server | `PingRequest` | `Promise<PongResponse>` |
| `getLatestBlockhash(request)` | Get most recent blockhash | `GetLatestBlockhashRequest` | `Promise<GetLatestBlockhashResponse>` |
| `getBlockHeight(request)` | Get current block height | `GetBlockHeightRequest` | `Promise<GetBlockHeightResponse>` |
| `getSlot(request)` | Get current slot number | `GetSlotRequest` | `Promise<GetSlotResponse>` |
| `isBlockhashValid(request)` | Validate blockhash | `IsBlockhashValidRequest` | `Promise<IsBlockhashValidResponse>` |
| `getVersion(request)` | Get server version info | `GetVersionRequest` | `Promise<GetVersionResponse>` |

#### Usage Example

```typescript
import { yellowstone } from '@kdt-sol/solana-grpc-client'

const client = new yellowstone.YellowstoneGeyserClient('wss://api.mainnet-beta.solana.com', {
    token: 'your-auth-token',
    'grpc.max_receive_message_length': 1024 * 1024 * 100,
})

// Get current slot
const slotResponse = await client.getSlot({})
console.log('Current slot:', slotResponse.slot)

// Subscribe to transactions with filters
const stream = await client.subscribe()
await stream.write({
    transactions: {
        'vote-transactions': {
            vote: true,
            failed: false,
            signature: undefined,
            accountInclude: [],
            accountExclude: [],
            accountRequired: [],
        },
    },
})
```

### OrbitJetstreamClient

Lightweight client for Orbit JetStream API optimized for high-frequency transaction monitoring.

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `subscribe(request)` | Subscribe to filtered transaction stream | `SubscribeRequest` | `StreamIterator` |
| `ping(request)` | Health check ping | `PingRequest` | `Promise<PongResponse>` |
| `getVersion(request)` | Get API version | `GetVersionRequest` | `Promise<GetVersionResponse>` |

### ThorStreamerClient

Specialized client for ThorStreamer API focusing on account updates and slot monitoring.

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `subscribeToTransactions(request)` | Subscribe to transaction updates | `SubscribeTransactionsRequest` | `StreamIterator` |
| `subscribeToAccountUpdates(request)` | Subscribe to account changes | `SubscribeAccountUpdatesRequest` | `StreamIterator` |
| `subscribeToSlotStatus(request)` | Subscribe to slot status updates | `SubscribeSlotStatusRequest` | `StreamIterator` |
| `subscribeToWalletTransactions(request)` | Subscribe to wallet-specific transactions | `SubscribeWalletTransactionsRequest` | `StreamIterator` |

### ShrederClient

Client for Shreder ShredStream API providing access to raw blockchain entries and filtered transactions.

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `subscribeEntries(request)` | Subscribe to raw block entries | `SubscribeEntriesRequest` | `StreamIterator` |
| `subscribeTransactions(request)` | Subscribe to filtered transactions | `SubscribeTransactionsRequest` | `DuplexStreamIterator` |

### CorvusArpcClient

Client for Corvus ARPC API providing advanced transaction filtering and monitoring through the Aurifex network.

#### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `subscribe()` | Subscribe to filtered transaction stream | None | `DuplexStreamIterator` |

#### Usage Example

```typescript
import { corvusArpc } from '@kdt-sol/solana-grpc-client'

const client = new corvusArpc.CorvusArpcClient('https://your-corvus-endpoint.com', {
    token: 'your-auth-token',
})

// Subscribe to transaction stream
const stream = await client.subscribe()

// Send subscription request with filters
await stream.write({
    transactions: {
        'my-filter': {
            accountInclude: ['YourTargetPubkey'],
            accountExclude: [],
            accountRequired: ['RequiredPubkey'],
        },
    },
    pingId: 1,
})

// Process filtered transactions
for await (const response of stream) {
    if (response.transaction) {
        console.log('Transaction:', {
            slot: response.transaction.slot,
            signatures: response.transaction.signatures,
            accounts: response.transaction.accountKeys,
        })
    }
}
```

---

## 💡 Usage Examples

### Advanced YellowStone Subscription

```typescript
import { yellowstone } from '@kdt-sol/solana-grpc-client'

async function advancedSubscription() {
    const client = new yellowstone.YellowstoneGeyserClient('wss://api.mainnet-beta.solana.com')
    const stream = await client.subscribe()

    // Multi-filter subscription
    await stream.write({
        accounts: {
            'token-accounts': {
                account: [],
                owner: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'], // SPL Token Program
                filters: [
                    { datasize: 165 }, // Token account size
                    { memcmp: { offset: 32, bytes: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' } }, // USDC mint
                ],
            },
        },
        transactions: {
            'swap-transactions': {
                vote: false,
                failed: false,
                accountInclude: ['9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'], // Raydium program
            },
        },
        blocks: {
            'recent-blocks': {
                accountInclude: [],
                includeTransactions: true,
                includeAccounts: false,
                includeEntries: false,
            },
        },
    })

    // Process different update types
    for await (const update of stream) {
        if (update.account) {
            console.log('Account update:', update.account.account?.pubkey)
        } else if (update.transaction) {
            console.log('Transaction:', update.transaction.transaction?.signature)
        } else if (update.block) {
            console.log('Block:', update.block.slot)
        }
    }
}
```

### ThorStreamer Real-time Monitoring

```typescript
import { thorStreamer } from '@kdt-sol/solana-grpc-client'

async function monitorWalletActivity() {
    const client = new thorStreamer.ThorStreamerClient('https://thor-endpoint.com')

    // Monitor specific wallet addresses
    const walletAddresses = [
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    ]

    const walletStream = await client.subscribeToWalletTransactions({
        addresses: walletAddresses,
        includeVotes: false,
    })

    for await (const transaction of walletStream) {
        console.log('Wallet activity detected:', {
            signature: transaction.signature,
            slot: transaction.slot,
            accounts: transaction.accounts,
            programIds: transaction.programIds,
        })
    }
}

// Monitor slot progression
async function monitorSlots() {
    const client = new thorStreamer.ThorStreamerClient('https://thor-endpoint.com')
    const slotStream = await client.subscribeToSlotStatus({})

    for await (const slotUpdate of slotStream) {
        console.log(`Slot ${slotUpdate.slot}: ${slotUpdate.status}`)

        if (slotUpdate.status === 'confirmed') {
            console.log('Slot confirmed with', slotUpdate.transactionCount, 'transactions')
        }
    }
}
```

### Shreder Raw Data Processing

```typescript
import { shreder } from '@kdt-sol/solana-grpc-client'

async function processRawEntries() {
    const client = new shreder.ShrederClient('https://shreder-endpoint.com', {
        token: 'your-auth-token',
    })

    // Subscribe to raw block entries
    const entriesStream = await client.subscribeEntries({
        startSlot: 250000000, // Start from specific slot
    })

    for await (const entry of entriesStream) {
        console.log('Raw entry:', {
            slot: entry.slot,
            numHashes: entry.numHashes,
            hash: entry.hash,
            transactions: entry.transactions?.length || 0,
        })

        // Process each transaction in the entry
        entry.transactions?.forEach((tx, index) => {
            console.log(`Transaction ${index}:`, {
                signature: tx.signature,
                messageHash: tx.messageHash,
                meta: tx.meta,
            })
        })
    }
}

// Filtered transaction monitoring
async function filterTransactions() {
    const client = new shreder.ShrederClient('https://shreder-endpoint.com')
    const stream = await client.subscribeTransactions({})

    // Send filter configuration
    await stream.write({
        filters: {
            'raydium-swaps': {
                programIds: ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'],
                accounts: [],
                instructions: true,
            },
            'token-transfers': {
                programIds: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
                accounts: [],
                instructions: false,
            },
        },
    })

    for await (const response of stream) {
        console.log('Filtered transaction:', {
            filters: response.filters,
            signature: response.transaction?.signature,
            slot: response.transaction?.slot,
        })
    }
}
```

### Corvus ARPC Advanced Filtering

```typescript
import { corvusArpc } from '@kdt-sol/solana-grpc-client'

async function advancedTransactionFiltering() {
    const client = new corvusArpc.CorvusArpcClient('https://corvus-endpoint.com', {
        token: 'your-auth-token',
    })

    const stream = await client.subscribe()

    // Set up multiple transaction filters
    await stream.write({
        transactions: {
            'dex-trades': {
                accountInclude: [
                    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Raydium
                    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium V4
                    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',  // Jupiter
                ],
                accountExclude: [],
                accountRequired: [],
            },
            'token-mints': {
                accountInclude: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
                accountExclude: [],
                accountRequired: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
            },
            'nft-trades': {
                accountInclude: [
                    'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K',  // Magic Eden
                    'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk', // Hadeswap
                ],
                accountExclude: [],
                accountRequired: [],
            },
        },
        pingId: Date.now(),
    })

    // Process filtered transactions
    for await (const response of stream) {
        console.log('Received response:', {
            createdAt: response.createdAt,
            filters: response.filters,
        })

        if (response.transaction) {
            const tx = response.transaction
            console.log('Transaction details:', {
                slot: tx.slot,
                signatures: tx.signatures.map(sig => Buffer.from(sig).toString('base64')),
                accountKeys: tx.accountKeys.map(key => Buffer.from(key).toString('base64')),
                instructions: tx.instructions.length,
                addressTableLookups: tx.addressTableLookups.length,
            })

            // Process instructions
            tx.instructions.forEach((instruction, index) => {
                console.log(`Instruction ${index}:`, {
                    programIdIndex: instruction.programIdIndex,
                    accountsLength: instruction.accounts.length,
                    dataLength: instruction.data.length,
                })
            })
        }

        // Send periodic ping to keep connection alive
        if (Date.now() % 30000 < 1000) { // Every ~30 seconds
            await stream.write({
                transactions: {},
                pingId: Date.now(),
            })
        }
    }
}

// Monitor specific wallet activity
async function monitorWalletWithCorvus() {
    const client = new corvusArpc.CorvusArpcClient('https://corvus-endpoint.com')
    const stream = await client.subscribe()

    const walletAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'

    await stream.write({
        transactions: {
            'wallet-activity': {
                accountInclude: [walletAddress],
                accountExclude: [],
                accountRequired: [walletAddress], // Ensure wallet is always involved
            },
        },
    })

    for await (const response of stream) {
        if (response.transaction) {
            console.log('Wallet activity detected:', {
                slot: response.transaction.slot,
                numSignatures: response.transaction.signatures.length,
                numAccounts: response.transaction.accountKeys.length,
                timestamp: response.createdAt,
            })
        }
    }
}
```

---

## 🛠️ Stream Management

### Using StreamIterator

```typescript
import { StreamIterator } from '@kdt-sol/solana-grpc-client'

async function handleStream() {
    const client = new jetstream.OrbitJetstreamClient('https://your-endpoint.com')
    const stream = await client.subscribe({ accounts: ['pubkey'] })

    // Stream implements AsyncIterable
    for await (const message of stream) {
        console.log('Received:', message)

        // Check if stream is still active
        if (stream.isEnded()) {
            console.log('Stream ended')
            break
        }
    }
}
```

### Using DuplexStreamIterator

```typescript
import { DuplexStreamIterator } from '@kdt-sol/solana-grpc-client'

async function handleBidirectionalStream() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')
    const stream = await client.subscribe()

    // Send requests
    await stream.write({
        accounts: { 'my-filter': { account: ['*'] } },
    })

    // Receive responses
    for await (const update of stream) {
        console.log('Update:', update)

        // Send another request based on the update
        if (update.account) {
            await stream.write({
                ping: { id: Date.now() },
            })
        }
    }
}
```

### Stream Lifecycle Management

```typescript
async function managedStream() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')
    const stream = await client.subscribe()

    // Set up error handling
    stream.on('error', (error) => {
        console.error('Stream error:', error)
    })

    stream.on('end', () => {
        console.log('Stream ended gracefully')
    })

    // Process with timeout
    const timeoutMs = 30000 // 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Stream timeout')), timeoutMs)
    })

    try {
        await Promise.race([
            (async () => {
                for await (const update of stream) {
                    console.log('Update:', update)
                }
            })(),
            timeoutPromise,
        ])
    } finally {
        // Cleanup
        if (!stream.isEnded()) {
            stream.end()
        }
    }
}
```

---

## 🚨 Error Handling

### Error Types

```typescript
import {
    BaseError,
    ConnectionError,
    ParseUrlError,
    InvalidInputError,
    MessageDecodingError
} from '@kdt-sol/solana-grpc-client'

async function handleErrors() {
    try {
        const client = new yellowstone.YellowstoneGeyserClient('invalid-url')
        await client.getVersion({})
    } catch (error) {
        if (error instanceof ConnectionError) {
            console.error('Connection failed:', error.message)
            // Implement retry logic
        } else if (error instanceof ParseUrlError) {
            console.error('Invalid URL format:', error.message)
            // Fix URL format
        } else if (error instanceof InvalidInputError) {
            console.error('Invalid input:', error.message)
            // Validate input parameters
        } else if (error instanceof MessageDecodingError) {
            console.error('Message decoding failed:', error.message)
            // Handle protocol errors
        } else if (error instanceof BaseError) {
            console.error('Client error:', error.message)
            // Generic error handling
        } else {
            console.error('Unknown error:', error)
            // Unexpected error
        }
    }
}
```

### Retry Mechanisms

```typescript
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error

            if (attempt === maxRetries) {
                throw lastError
            }

            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }

    throw lastError!
}

// Usage
const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')
const version = await withRetry(() => client.getVersion({}))
```

---

## 🔧 Advanced Topics

### Custom Authentication

```typescript
const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com', {
    token: 'your-jwt-token',
    tokenMetadataKey: 'x-auth-token', // Custom header name
    metadata: {
        'client-id': 'my-app',
        'client-version': '1.0.0',
    },
})
```

### Performance Optimization

```typescript
const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com', {
    // Increase message size limits
    'grpc.max_receive_message_length': 1024 * 1024 * 100, // 100MB
    'grpc.max_send_message_length': 1024 * 1024 * 10,     // 10MB

    // Keepalive settings
    'grpc.keepalive_time_ms': 30000,
    'grpc.keepalive_timeout_ms': 5000,
    'grpc.keepalive_permit_without_calls': true,

    // Stream settings
    receiveTimeout: 120000, // 2 minutes
    endTimeout: 5000,       // 5 seconds
    drainTimeout: 5000,     // 5 seconds
})
```

### Monitoring and Metrics

```typescript
async function monitoredStream() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')
    const stream = await client.subscribe()

    let messageCount = 0
    let bytesReceived = 0
    const startTime = Date.now()

    // Metrics collection
    setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const messagesPerSecond = messageCount / elapsed
        const mbPerSecond = (bytesReceived / elapsed) / (1024 * 1024)

        console.log(`Metrics: ${messagesPerSecond.toFixed(2)} msg/s, ${mbPerSecond.toFixed(2)} MB/s`)
    }, 10000)

    for await (const update of stream) {
        messageCount++
        bytesReceived += JSON.stringify(update).length

        // Process update...
    }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### Connection Timeouts

```typescript
// Problem: Connection timeouts
// Solution: Increase timeout values
const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com', {
    'grpc.keepalive_time_ms': 30000,
    'grpc.keepalive_timeout_ms': 10000,
    receiveTimeout: 300000, // 5 minutes
})
```

#### Memory Issues

```typescript
// Problem: High memory usage
// Solution: Implement backpressure handling
async function handleBackpressure() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')
    const stream = await client.subscribe()

    let pendingMessages = 0
    const maxPending = 100

    for await (const update of stream) {
        if (pendingMessages >= maxPending) {
            console.log('Backpressure: pausing stream processing')
            await new Promise(resolve => setTimeout(resolve, 100))
            continue
        }

        pendingMessages++
        processUpdate(update).finally(() => {
            pendingMessages--
        })
    }
}
```

#### Authentication Errors

```typescript
// Problem: 401 Unauthorized
// Solution: Check token format and metadata key
const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com', {
    token: 'Bearer your-jwt-token', // Include 'Bearer ' prefix if required
    tokenMetadataKey: 'authorization', // Default: 'authorization'
})
```

### Debug Mode

```typescript
// Enable debug logging
process.env.GRPC_VERBOSITY = 'DEBUG'
process.env.GRPC_TRACE = 'all'

const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')
```

### Health Checks

```typescript
async function healthCheck() {
    const client = new yellowstone.YellowstoneGeyserClient('https://your-endpoint.com')

    try {
        const pong = await client.ping({ id: Date.now() })
        console.log('Health check passed:', pong)
        return true
    } catch (error) {
        console.error('Health check failed:', error)
        return false
    }
}

// Run health checks periodically
setInterval(healthCheck, 30000) // Every 30 seconds
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/kdt-sol/solana-grpc-client.git
cd solana-grpc-client
pnpm install

# Generate proto types
pnpm run proto:generate

# Build
pnpm run build

# Test
pnpm test

# Lint
pnpm run lint
```

### Reporting Issues

When reporting issues, please include:

1. Library version
2. Node.js version
3. Operating system
4. Minimal reproduction code
5. Error messages and stack traces

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ for the Solana ecosystem</sub>
</div>
