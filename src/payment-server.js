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
import address from './hedera/address'
const env = process.env.NODE_ENV

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

const app = express()
const server = http.createServer(app)
const io = ioServer().listen(server)

// let node = address.getNodeAddr(submissionNode)
// console.log('node 44444444444444 : ', node)
// const hedera = new Hedera.Client(node.address, node.account)


let hedera = new Hedera.Client(
    config[env].NODE_ADDRESS,
    config[env].NODE_ACCOUNT
)
let client = hedera.connect()

// just a blank page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// socketio client to publisher's socketio server
let ioClientPublisher = ioClient(PUBLISHER_SERVER)
ioClientPublisher.on('connect', function () {
    console.log(`Connected to ${PUBLISHER_SERVER} SocketIO Server`)
})

io.on('connection', function (socket) {
    let clientID = socket.id
    let clientIP = socket.handshake.address
    if (client) client.socket = socket
    console.log('User-Client Connected!: IP: ' + clientIP)

    // Note: balance request can be directly handled by Hedera chrome extension with grpc-web
    // once Hedera implements grpc-web support

    // CRYPTOGETACCOUNTBALANCE
    socket.on(CRYPTOGETACCOUNTBALANCE, async function (data) {
        console.log(CRYPTOGETACCOUNTBALANCE, clientID, data)
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
    socket.on(TRANSACTIONGETRECEIPT, async function (data) {
        // console.log(TRANSACTIONGETRECEIPT, clientID, data)
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
    socket.on(CRYPTOTRANSFER, async function (msg) {
        // console.log(CRYPTOTRANSFER, clientID, msg)
        let responseData, tx
        try {
            console.log("1111111111 000000000 1111111111")
            console.log(msg)
            let result = await client.cryptoTransferProxy(msg)
            responseData = result.responseData
            tx = result.tx
            let data = Hedera.parseTx(tx)
            data.nodePrecheckcode = responseData.nodePrecheckcode
            // successful cryptoTransfer, so perform additional tasks
            if (responseData.nodePrecheckcode === 0) {
                await portalReward(data) // reward the account
            }
            // whether our cryptoTransfer succeeds or fails, we want to notify the publisher,
            // for publisher's record
            if (publisherAPIExists) {
                await publisherAPI(data) // use REST API POST
            } else {
                ioClientPublisher.binary(true).emit(CRYPTOTRANSFER, data) // use socketio
            }
        } catch (e) {
            console.log(e)
        }

        socket.binary(true).emit(`${CRYPTOTRANSFER}_RESPONSE`, responseData)
    })

    // CONTRACTCALL
    socket.on(CONTRACTCALL, async function (data) {
        console.log(CONTRACTCALL, clientID, data)
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
    socket.on(FILEGETCONTENTS, async function (data) {
        console.log(FILEGETCONTENTS, clientID, data)
        let responseData
        try {
            responseData = await client.fileGetContentsProxy(data)
        } catch (e) {
            console.log(e)
        }
        console.log(`${FILEGETCONTENTS}_RESPONSE`, responseData)
        socket.binary(true).emit(`${FILEGETCONTENTS}_RESPONSE`, responseData)
    })

    socket.on('disconnect', function (data) {
        if (env !== 'test') console.log(clientID + ' has disconnected')
    })
})

export default server
