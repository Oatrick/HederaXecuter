import grpc from 'grpc'
import { CryptoServiceClient } from './pbnode/CryptoService_grpc_pb'
import { FileServiceClient } from './pbnode/FileService_grpc_pb'
import { SmartContractServiceClient } from './pbnode/SmartContractService_grpc_pb'
import { getAccountBalance, getAccountBalanceProxy } from './getaccountbalance'
import { cryptoTransfer, cryptoTransferProxy } from './cryptotransfer'
import { contractCallProxy } from './contractcall'
import { getTransactionReceiptsProxy } from './gettransactionreceipts'
import { fileGetContentsProxy } from './filegetcontents'
import i from './internal'

class Hedera {
    constructor(build) {
        this.clientCrypto = build.clientCrypto
        this.clientFile = build.clientFile
        this.clientContract = build.clientContract
        this.nodeAccountID = build.nodeAccountID
        this.operator = build.operator
    }

    static get Client() {
        class Client {
            constructor(address, nodeAccount) {
                this.clientCrypto = new CryptoServiceClient(
                    address,
                    grpc.credentials.createInsecure()
                )
                this.clientFile = new FileServiceClient(
                    address,
                    grpc.credentials.createInsecure()
                )
                this.clientContract = new SmartContractServiceClient(
                    address,
                    grpc.credentials.createInsecure()
                )
                this.nodeAccountID = i.accountIDFromString(nodeAccount)
            }
            withOperator(keypair, account) {
                this.operator = {}
                this.operator.keypair = keypair
                this.operator.account = i.accountIDFromString(account)
                return this
            }
            connect() {
                return new Hedera(this)
            }
        }
        return Client
    }

    // nodejs-pbnode gRPC call to Hedera
    getAccountBalance(account) {
        getAccountBalance(this, account)
    }

    // nodejs-pbnode gRPC call to Hedera
    cryptoTransfer(senderAccount, recipientAccount, amount) {
        cryptoTransfer(this, senderAccount, recipientAccount, amount)
    }

    // handles incoming socketio data (query or transaction, in bytes) from web client, calls Hedera, and returns the response data back to socketio client
    async getAccountBalanceProxy(msg) {
        let response = await getAccountBalanceProxy(this, msg)
        return response
    }

    // handles incoming socketio data (query or transaction, in bytes) from web client, calls Hedera, and returns the response data back to socketio client
    async cryptoTransferProxy(msg) {

        console.log("22222222 000000000 222222222")
        console.log(msg)
        let response = await cryptoTransferProxy(this, msg)
        return response
    }

    // handles incoming socketio data (query or transaction, in bytes) from web client, calls Hedera, and returns the response data back to socketio client
    async contractCallProxy(msg) {
        let response = await contractCallProxy(this, msg)
        return response
    }

    async getTransactionReceiptsProxy(msg) {
        let response = await getTransactionReceiptsProxy(this, msg)
        return response
    }

    async fileGetContentsProxy(msg) {
        let response = await fileGetContentsProxy(this, msg)
        return response
    }

    static parseTx(tx) {
        return i.parseTx(tx)
    }
}

export default Hedera
