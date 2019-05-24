import express from 'express'
import http from 'http'
import path from 'path'

import ioServer from 'socket.io'
import ioClient from 'socket.io-client'

import config from './config'

import Hedera from './hedera'
import { Query } from './hedera/pbnode/Query_pb'
import { TransactionBody } from './hedera/pbnode/Transaction_pb'
import { enumKeyByValue } from './hedera/utils'
import portalReward from './portal'
import { publisherAPIExists, publisherAPI } from './publisher'
import logger from './logger'

const env = ENV_NAME

// on staging, PUBLISHER_SERVER is https://thetimesta.mp
// on production, PUBLISHER_SERVER is https://dailytimestamp.com
const PUBLISHER_SERVER = `${config[env].PUBLISHER_SERVER}`

// transactions
const Tx = TransactionBody.DataCase
const CRYPTOTRANSFER = enumKeyByValue(Tx, Tx.CRYPTOTRANSFER)
const CONTRACTCALL = enumKeyByValue(Tx, Tx.CONTRACTCALL)

// queries
const Q = Query.QueryCase
const CRYPTOGETACCOUNTBALANCE = enumKeyByValue(Q, Q.CRYPTOGETACCOUNTBALANCE)
const TRANSACTIONGETRECEIPT = enumKeyByValue(Q, Q.TRANSACTIONGETRECEIPT)
const FILEGETCONTENTS = enumKeyByValue(Q, Q.FILEGETCONTENTS)

/**
 * Returns the created server instance with express and socketio events
 * @returns {object}
 */
const createServer = () => {
    const app = express()
    const server = http.createServer(app)
    const io = ioServer().listen(server)

    let hedera = new Hedera.Client()

    // just a blank page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'))
    })

    // socketio client to publisher's socketio server
    let ioClientPublisher = ioClient(PUBLISHER_SERVER)
    ioClientPublisher.on('connect', function() {
        console.log(`Connected to ${PUBLISHER_SERVER} SocketIO Server`)
    })

    io.on('connection', function(socket) {
        let clientID = socket.id
        let clientIP = socket.handshake.address
        console.log('User-Client Connected!: IP: ' + clientIP)

        // Note: balance request can be directly handled by Hedera chrome extension with grpc-web
        // once Hedera implements grpc-web support

        // CRYPTOGETACCOUNTBALANCE
        socket.on(CRYPTOGETACCOUNTBALANCE, async function(data) {
            console.log(CRYPTOGETACCOUNTBALANCE, clientID, data)
            let client = hedera.withNodeFromQ(data).connect()
            let responseData
            try {
                responseData = await client.getAccountBalanceProxy(data)
            } catch (e) {
                console.log(e)
            }
            console.log(`${CRYPTOGETACCOUNTBALANCE}_RESPONSE`, responseData)
            socket
                .binary(true)
                .emit(`${CRYPTOGETACCOUNTBALANCE}_RESPONSE`, responseData)
        })

        // TRANSACTIONGETRECEIPT
        socket.on(TRANSACTIONGETRECEIPT, async function(data) {
            let client = hedera.withNodeFromQ(data).connect()
            let responseData
            try {
                responseData = await client.getTransactionReceiptsProxy(data)
            } catch (e) {
                console.log(e)
            }
            // console.log(`${TRANSACTIONGETRECEIPT}_RESPONSE`, responseData)
            socket
                .binary(true)
                .emit(`${TRANSACTIONGETRECEIPT}_RESPONSE`, responseData)
        })

        // CRYPTOTRANSFER
        socket.on(CRYPTOTRANSFER, async function(data) {
            let responseData, tx
            let client = hedera.withNodeFromTx(data).connect()

            // make the gRPC call (we can't use try-catch here)
            let result = await client.cryptoTransferProxy(data)

            // resultTx is prepared for publisher and for portal
            // responseData is prepared for hedera-browser-extension
            responseData = result.responseData
            tx = result.tx
            let resultTx = Hedera.parseTx(tx)
            resultTx.nodePrecheckcode = responseData.nodePrecheckcode
            logger.info('CRYPTOTRANSFER resultTx', resultTx)

            // successful cryptoTransfer, so perform additional tasks
            if (responseData.nodePrecheckcode === 0) {
                await portalReward(resultTx) // reward the account
            }
            // whether our cryptoTransfer succeeds or fails, we want to notify the publisher,
            // for publisher's record
            logger.info('CRYPTOTRANSFER notify publisher', publisherAPIExists())
            if (publisherAPIExists()) {
                logger.info('CRYPTOTRANSFER notify publisher', resultTx) // what did we pass to our Publisher?
                await publisherAPI(resultTx) // use REST API POST
            } else {
                ioClientPublisher.binary(true).emit(CRYPTOTRANSFER, resultTx) // use socketio
            }

            // response back to client
            logger.info('CRYPTOTRANSFER RESPONSE', responseData)
            socket.binary(true).emit(`${CRYPTOTRANSFER}_RESPONSE`, responseData)
        })

        // CONTRACTCALL
        socket.on(CONTRACTCALL, async function(data) {
            console.log(CONTRACTCALL, clientID, data)
            let client = hedera.withNodeFromTx(data).connect()
            let responseData
            try {
                responseData = await client.contractCallProxy(data)
            } catch (e) {
                console.log(e)
            }
            console.log(`${CONTRACTCALL}_RESPONSE`, responseData)
            socket.binary(true).emit(`${CONTRACTCALL}_RESPONSE`, responseData)
        })

        // FILEGETCONTENTS
        socket.on(FILEGETCONTENTS, async function(data) {
            console.log(FILEGETCONTENTS, clientID, data)
            let client = hedera.withNodeFromQ(msg).connect()
            let responseData
            try {
                responseData = await client.fileGetContentsProxy(data)
            } catch (e) {
                console.log(e)
            }
            console.log(`${FILEGETCONTENTS}_RESPONSE`, responseData)
            socket
                .binary(true)
                .emit(`${FILEGETCONTENTS}_RESPONSE`, responseData)
        })

        socket.on('disconnect', function(data) {
            if (env !== 'test') console.log(clientID + ' has disconnected')
        })
    })

    return { server, io }
}

export default createServer
