import axios from 'axios'
import config from '../config'

const env = process.env.NODE_ENV

// on staging, PORTAL is https://api.dev.portal.hedera.com
// on production, PORTAL is https://api.portal.hedera.com
const PORTAL = `${config[env].PORTAL}`
const PORTAL_REWARD_DAILYTIMESTAMP = `${PORTAL}/v1/_/daily-timestamp/activity`
const PORTAL_TOKEN = `${config[env].PORTAL_TOKEN}`

async function portalReward(data) {
    console.log('REWARD', data)
    console.log(PORTAL)
    try {
        let headers = {
            'Content-Type': 'application/json',
            authorization: PORTAL_TOKEN
        }
        let res = await axios.post(PORTAL_REWARD_DAILYTIMESTAMP, data, {
            headers
        })
        console.log(`REWARD RESPONSE from ${PORTAL}`, res.status)
    } catch (e) {
        console.log(`REWARD ERROR from ${PORTAL}`, e)
    }
}

export default portalReward
