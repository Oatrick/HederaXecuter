#!/usr/bin/env node

const forge = require('node-forge')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const testdata = require('../src/config/testdata.json')
// const configPaymentServer = require('../src/config/index')
const configPaymentServer =
    'http://localhost:9090/?rest_route=/hedera-micropayment/v1/hello'

const ed25519 = forge.pki.ed25519

let env = process.env.NODE_ENV
if (env === undefined) {
    env = 'development'
}

let currentDir = process.cwd()
let wordpressCredentialsPath = path.join(
    currentDir,
    'src',
    'config',
    'wordpress.json'
)

wp = JSON.parse(fs.readFileSync(wordpressCredentialsPath))
console.log('wp', wp)

let privateKeyBytes = forge.util.hexToBytes(wp.privateKey)

// Use test data here
let data = testdata

let message = Buffer.from(JSON.stringify(data))

let encoding = 'binary'

let signature = ed25519.sign({
    message: message,
    encoding: 'binary',
    privateKey: privateKeyBytes
})

let signatureHex = forge.util.bytesToHex(signature)

console.log('message', message)
console.log('message string', JSON.stringify(data))
console.log('signatureHex', signatureHex)

console.log()
console.log('SEND TO WORDPRESS')
console.log()

let config = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + signatureHex
    }
}

axios
    .post(configPaymentServer, data, config)
    .then(res => {
        console.log('Response data', res.data)
        // how does the token comes in?
    })
    .catch(err => {
        console.log('An error occurred', err)
    })
