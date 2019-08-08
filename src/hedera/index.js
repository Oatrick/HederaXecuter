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
// import { i, CryptoTransfer} from 'hedera-sdk-ts'

import address from './address'
import logger from '../logger'

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
            // if nodeAccount and nodeAddress are not provided,
            // our client will not be initialised with them,
            // we will have to do so later using withNode or withNodeFromTx or withNodeFromQ
            constructor(nodeAccount = undefined, nodeAddress = undefined) {
                if (nodeAddress !== undefined) {
                    this.setClients(nodeAddress)
                }
                if (nodeAccount !== undefined) {
                    this.setNodeAccount(nodeAccount)
                }
            }
            // if we didn't set the nodeAccount and nodeAddress when we initialised the client, we can use this method
            withNode(nodeAccount, nodeAddress = undefined) {
                this.setNodeAccount(nodeAccount)
                // if nodeAddress is undefined, this.setClients is smart enough to retrieve
                // the appropriate node address from our address book
                this.setClients(nodeAddress)
                return this
            }

            // if we didn't set the nodeAccount and nodeAddress when we initialised the client, we can use this method
            // where tx is a binary data from a client
            withNodeFromTx(tx) {
                this.nodeAccountID = i.parseNodeAccountFromTx(tx)
                this.setClients()
                return this
            }

            // if we didn't set the nodeAccount and nodeAddress when we initialised the client, we can use this method
            // where q is a binary data from a client
            withNodeFromQ(q) {
                this.nodeAccountID = i.parseNodeAccountFromQ(q)
                this.setClients()
                return this
            }

            withOperator(keypair, account) {
                this.operator = {}
                this.operator.keypair = keypair
                this.operator.account = i.accountIDFromString(account)
                return this
            }

            // there's no need to provide nodeAddress if we setNodeAccount
            setClients(nodeAddress = undefined) {
                if (nodeAddress === undefined) {
                    const nodeAccount = i.accountStringFromAccountID(
                        this.nodeAccountID
                    )
                    nodeAddress = address.getNodeAddressFromNodeAccount(
                        nodeAccount
                    )
                }

                this.clientCrypto = new CryptoServiceClient(
                    nodeAddress,
                    grpc.credentials.createInsecure()
                )
                this.clientFile = new FileServiceClient(
                    nodeAddress,
                    grpc.credentials.createInsecure()
                )
                this.clientContract = new SmartContractServiceClient(
                    nodeAddress,
                    grpc.credentials.createInsecure()
                )
            }

            setNodeAccount(nodeAccount) {
                this.nodeAccountID = i.accountIDFromString(nodeAccount)
            }

            connect() {
                if (
                    this.clientCrypto === undefined ||
                    this.clientFile === undefined ||
                    this.clientContract === undefined ||
                    this.nodeAccountID === undefined
                ) {
                    let { nodeAccount, nodeAddress } = address.getRandomNode()
                    this.setNodeAccount(nodeAccount)
                    this.setClients(nodeAddress)
                }
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
        logger.info('CRYPTOTRANSFER data from client', msg)
        // let response = await CryptoTransfer.cryptoTransferProxy(this, msg)
        let response = await cryptoTransferProxy(this, msg)
        console.log("fails here", response)
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
