import { AccountID, Signature, SignatureList } from './pbnode/BasicTypes_pb'
import { Timestamp } from './pbnode/Timestamp_pb'
import { Duration } from './pbnode/Duration_pb'
import { Transaction } from './pbnode/Transaction_pb'
import forge from 'node-forge'

const ed25519 = forge.pki.ed25519

// account is a string delimited by a dot, e.g. "0.0.1001"
// where the first value represents the shard num
// the second value represents the realm num; and
// the last value represents the account num.
function accountIDFromString(account) {
    let accountArray = account.split('.').map(Number)
    let accountID = new AccountID()
    accountID.setShardnum(accountArray[0])
    accountID.setRealmnum(accountArray[1])
    accountID.setAccountnum(accountArray[2])
    return accountID
}

function accountStringFromAccountID(accountID) {
    if (accountID === undefined || accountID === null) {
        return undefined
    }
    return `${accountID
        .getShardnum()
        .toString()}.${accountID
        .getRealmnum()
        .toString()}.${accountID.getAccountnum().toString()}`
}

function fileStringFromFileID(fileID) {
    if (fileID === undefined || fileID === null) {
        return undefined
    }
    return `${fileID
        .getShardnum()
        .toString()}.${fileID
        .getRealmnum()
        .toString()}.${fileID.getFilenum().toString()}`
}

function contractStringFromContractID(contractID) {
    if (contractID === undefined || contractID === null) {
        return undefined
    }
    return `${contractID
        .getShardnum()
        .toString()}.${contractID
        .getRealmnum()
        .toString()}.${contractID.getContractnum().toString()}`
}

function getTimestamp() {
    let ts = new Timestamp()
    let seconds = Math.round((new Date().getTime() - 5000) / 1000)
    ts.setSeconds(seconds)
    return ts
}

/**
 *
 * randNodeAddr provides a random node for grpc calls
 * @param {object} nodeAddresses
 * @returns object that contains the node ip and node accountID
 */
function randNodeAddr(nodeAddresses) {
    let randNodeGen =
        nodeAddresses[Math.floor(Math.random() * nodeAddresses.length)]
    let randNodeSplit = JSON.stringify(randNodeGen).split(/"/)
    let address = randNodeSplit[3]
    let account = randNodeSplit[1]
    return {
        address,
        account
    }
}

/**
 *
 * nodeAddr provides the chosen node that exist in the list of node addresses (file 0.0.101) for grpc calls.
 * @param {object} account
 * @param {Array} nodeAddresses
 * @returns object that contains the node ip and node accountID
 */
function nodeAddr(account, nodeAddresses) {
    let address
    let retrieveNodeFromList = nodeAddresses.find(obj =>
        obj.hasOwnProperty(account)
    )
    if (isNullOrUndefined(retrieveNodeFromList)) {
        throw new Error('node does not exist, please choose other nodes')
    }
    address = retrieveNodeFromList[account]
    return {
        address,
        account
    }
}

function getDuration() {
    let d = new Duration()
    d.setSeconds(60)
    return d
}

function signWithKeys(txBodyBytes, ...privateKeysInHex) {
    let privateKeys = []
    privateKeysInHex.forEach(function(pkInHex) {
        let privateKeyInBytes = forge.util.hexToBytes(pkInHex)
        privateKeys.push(privateKeyInBytes)
    })

    let ed25519Signatures = []
    privateKeys.forEach(function(pk) {
        let sig = new Signature()
        let signature = ed25519.sign({
            message: txBodyBytes,
            privateKey: pk
        })
        sig.setEd25519(signature)
        ed25519Signatures.push(sig)
    })
    // prepare sigList container
    let sigList = new SignatureList()
    sigList.setSigsList(ed25519Signatures)
    return sigList
}

function parseTx(tx) {
    let txObj = Transaction.toObject(true, tx)
    let memo = txObj.body.memo // memo
    let a = txObj.body.transactionid.accountid
    let account = `${a.shardnum}.${a.realmnum}.${a.accountnum}` // account
    let txValidStart = txObj.body.transactionid.transactionvalidstart
    let transactionId = `${account}@${txValidStart.seconds}.${
        txValidStart.nanos
    }` // transactionID
    let accountamountsList =
        txObj.body.cryptotransfer.transfers.accountamountsList
    let cost = Math.abs(accountamountsList[0].amount)
    return {
        transactionId,
        account,
        memo,
        cost
    }
}

const parseNodeAccountFromTx = msg => {
    const tx = Transaction.deserializeBinary(msg)
    return tx.getBody().getNodeaccountid()
}

const parseNodeAccountFromQ = msg => {
    const q = Query.deserializeBinary(msg)
    return q.getBody().getNodeaccountid()
}

export default {
    accountIDFromString,
    accountStringFromAccountID,
    fileStringFromFileID,
    contractStringFromContractID,
    getTimestamp,
    getDuration,
    signWithKeys,
    parseTx,
    randNodeAddr,
    parseNodeAccountFromTx,
    parseNodeAccountFromQ
}
