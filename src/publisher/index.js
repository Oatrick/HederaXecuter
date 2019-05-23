import config from '../config'
import logger from '../logger'

import axios from 'axios'

import forge from 'node-forge'

const ed25519 = forge.pki.ed25519

const env = ENV_NAME

const PUBLISHER_API_SECRET = `${config[env].PUBLISHER_API_SECRET}`
const PUBLISHER_API_POST = `${config[env].PUBLISHER_API_POST}`
const PUBLISHER_SERVER = `${config[env].PUBLISHER_SERVER}`
const API = `${PUBLISHER_SERVER}${PUBLISHER_API_POST}`

const publisherAPIExists = () => {
    if (config[env] === undefined) {
        return false
    }
    if (PUBLISHER_API_POST === '' || PUBLISHER_API_SECRET === '') {
        return false
    }
    return true
}

// Does our publisher API support REST API POST?
const publisherAPI = async data => {
    const authorization = signDataAndReturnAuthorization(data)
    try {
        let headers = {
            'Content-Type': 'application/json',
            authorization
        }
        let res = await axios.post(API, data, {
            headers
        })
        logger.info(`PUBLISHER RESPONSE FROM ${API}`, res.status)
    } catch (e) {
        logger.error(`PUBLISHER ERROR from ${API}`, e)
    }
}

const signDataAndReturnAuthorization = data => {
    const privateKey = forge.util.hexToBytes(PUBLISHER_API_SECRET) // privateKey bytes
    const message = Buffer.from(JSON.stringify(data))
    const encoding = 'binary'
    const signature = ed25519.sign({
        message,
        encoding,
        privateKey
    })
    const signatureHex = forge.util.bytesToHex(signature)
    return 'Bearer ' + signatureHex
}

export { publisherAPI, publisherAPIExists }
