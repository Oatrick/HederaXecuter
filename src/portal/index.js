import axios from 'axios'
import config from '../config'
import logger from '../logger'

const env = ENV_NAME

// on staging, PORTAL is https://api.dev.portal.hedera.com
// on production, PORTAL is https://api.portal.hedera.com
const PORTAL = config[env].PORTAL
let PORTAL_REWARD_DAILYTIMESTAMP
if (PORTAL !== undefined) {
    PORTAL_REWARD_DAILYTIMESTAMP = `${PORTAL}/v1/_/daily-timestamp/activity`
}
const PORTAL_TOKEN = config[env].PORTAL_TOKEN

async function portalReward(data) {
    logger.info('REWARD', data)
    try {
        if (PORTAL === undefined) {
            logger.info('PORTAL is not declared, so we skip')
            return
        }
        let headers = {
            'Content-Type': 'application/json',
            authorization: PORTAL_TOKEN
        }
        let res = await axios.post(PORTAL_REWARD_DAILYTIMESTAMP, data, {
            headers
        })
        logger.info(`REWARD RESPONSE from ${PORTAL}`, res.status)
    } catch (e) {
        logger.error(`REWARD ERROR from ${PORTAL}`, e)
    }
}

export default portalReward
