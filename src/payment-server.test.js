/**
 * @jest-environment node
 */

import server from './payment-server'
import axios from 'axios'
// in config/index.js, please set up test values for our test environment
import config from './config'
import ioClient from 'socket.io-client'
import { Query } from './hedera/pbnode/Query_pb'
import { enumKeyByValue } from './hedera/utils'
import testdata from './__setup__/testdata'

const env = process.env.NODE_ENV
const PORT = 9099
const MICROPAYMENT_SERVER = config[env].MICROPAYMENT_SERVER

const Q = Query.QueryCase
const CRYPTOGETACCOUNTBALANCE = enumKeyByValue(Q, Q.CRYPTOGETACCOUNTBALANCE)

const ioOptions = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
}

let socket

describe('payment-server events', function() {
    beforeEach(done => {
        server.listen(PORT, done)
        socket = ioClient.connect(MICROPAYMENT_SERVER, ioOptions)
        done()
    })

    afterEach(done => {
        server.close(done)
        socket.disconnect()
        done()
    })

    test('Homepage should return status 200', async () => {
        let response = await axios.get(MICROPAYMENT_SERVER)
        expect(response.status).toBe(200)
    })

    test(`${CRYPTOGETACCOUNTBALANCE} events`, done => {
        // we should prepare the actual query object instead of using null
        let data = null
        socket.emit(CRYPTOGETACCOUNTBALANCE, data)
        socket.on(`${CRYPTOGETACCOUNTBALANCE}_RESPONSE`, function(res) {
            expect(res).toEqual(testdata.getaccountbalance)
            done()
        })
    })
})
