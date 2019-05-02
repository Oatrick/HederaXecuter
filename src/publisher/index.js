import config from '../config'
import axios from 'axios'

const env = process.env.NODE_ENV

const PUBLISHER_API_SECRET = `${config[env].PUBLISHER_API_SECRET}`
const PUBLISHER_API_POST = `${config[env].PUBLISHER_API_POST}`
const PUBLISHER_SERVER = `${config[env].PUBLISHER_SERVER}`
const API = `${PUBLISHER_SERVER}${PUBLISHER_API_POST}`

function publisherAPIExists() {
    if (config[env] === undefined) {
        return false
    }
    if (PUBLISHER_API_POST === '' || PUBLISHER_API_SECRET === '') {
        return false
    }
    return true
}

// Does our publisher API support REST API POST?
async function publisherAPI(data) {
    try {
        let headers = {
            'Content-Type': 'application/json',
            authorization: PUBLISHER_API_SECRET
        }
        let res = await axios.post(API, data, {
            headers
        })
        console.log(`PUBLISHER RESPONE FROM ${API}`, res.status)
    } catch (e) {
        console.log(`PUBLISHER ERROR from ${API}`, e)
    }
}

export { publisherAPI, publisherAPIExists }
