import i from './internal'
import { isNullOrUndefined } from 'util'

/**
 *
 * retrieves a node from a list of node addresses depending on build environment.
 * If submissionNode parsed in from publisher's micropayment tag is null or undefined,
 * allow extension to choose a random node for transaction calls
 * @param {string} submissionNode
 * @returns the node address and node account
 */
function getNodeAddr(submissionNode) {
    log('submissionNodeparsed into getNodeAddr is : ', submissionNode)

    log(ADDRESS_BOOK)
    let node
    if (isNullOrUndefined(submissionNode) || submissionNode.trim() === '') {
        node = i.randNodeAddr(ADDRESS_BOOK)
    } else {
        let validateSubmissionNode = submissionNode.split('.')
        if (parseInt(validateSubmissionNode[2]) < 3) {
            throw new Error('node is not available, please choose other nodes')
        }
        node = i.nodeAddr(submissionNode, ADDRESS_BOOK)
    }
    return node
}

export default { getNodeAddr }
