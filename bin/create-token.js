#!/usr/bin/env node

const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

function generateKeys(wordpressCredentialsPath) {
    const ed25519 = forge.pki.ed25519
    let keypair = ed25519.generateKeyPair()
    let privateKeyHex = forge.util.bytesToHex(keypair.privateKey)
    let publicKeyHex = forge.util.bytesToHex(keypair.publicKey)
    let wordpress = {
        privateKey: privateKeyHex,
        publicKey: publicKeyHex
    }
    let wordpressString = JSON.stringify(wordpress, null, 2)
    fs.writeFileSync(wordpressCredentialsPath, wordpressString)
}

let currentDir = process.cwd()
console.log(currentDir)

let wordpressCredentialsPath = path.join(
    currentDir,
    'src',
    'config',
    'wordpress.json'
)

let wp

try {
    if (fs.existsSync(wordpressCredentialsPath)) {
        // file exists
        console.log('wordpress.json already exists')
        wp = JSON.parse(fs.readFileSync(wordpressCredentialsPath))
    } else {
        // generate keys and write to path
        console.log('No wordpress credentials yet, create it')
        generateKeys(wordpressCredentialsPath)
        console.log('created')
    }
} catch (e) {
    console.log('Here is the error', e)
}
