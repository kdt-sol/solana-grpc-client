import { credentials } from '@grpc/grpc-js'

export function createCredential(isInsecure: boolean) {
    return isInsecure ? credentials.createInsecure() : credentials.createSsl()
}
