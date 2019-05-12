import i from './internal'
import {
    CryptoGetAccountBalanceQuery,
    CryptoGetAccountBalanceResponse
} from './pbnode/CryptoGetAccountBalance_pb'
import { QueryHeader, ResponseType } from './pbnode/QueryHeader_pb'
import { Query } from './pbnode/Query_pb'
import { Response } from './pbnode/Response_pb'
import { ResponseHeader } from './pbnode/ResponseHeader_pb'
import { AccountID } from './pbnode/BasicTypes_pb'
import logger from '../logger'

// self refers to the instance of Hedera (Hedera object).
// account refers to the account we are asking the balance from. It is a string delimited by dot.
function getAccountBalance(self, account) {
    logger.info('getAccountBalance makes a gRPC call to Hedera network')
    if (self.operator === undefined) {
        // operator (e.g. the current account that's paying)
        logger.warn(
            'please set the operator who will pay for this transaction before calling getAccountBalance'
        )
        return
    }

    let amount = 0 // NOTE: node fee functionality will be made available later, in the meantime, we hardcode as 0
    let senderAccount = i.accountStringFromAccountID(self.operator.account) // whoever is the operator pays
    let recipientAccount = i.accountStringFromAccountID(self.nodeAccountID) // node account gets paid
    let tx = cryptoTransfer(self, senderAccount, recipientAccount, amount)

    // prepare query header
    let qHeader = new QueryHeader()
    qHeader.setPayment(tx)
    qHeader.setResponsetype(ResponseType.ANSWER_ONLY)

    // prepare query
    let cryptoGetAccountBalanceQuery = new CryptoGetAccountBalanceQuery()
    cryptoGetAccountBalanceQuery.setHeader(qHeader)
    cryptoGetAccountBalanceQuery.setAccountid(i.accountIDFromString(account))
    logger.info(
        'Our cryptoGetAccountBalanceQuery is',
        cryptoGetAccountBalanceQuery.toObject()
    )
    let q = new Query()
    q.setCryptogetaccountbalance(cryptoGetAccountBalanceQuery)

    // make the request
    self.clientCrypto.cryptoGetBalance(q, function(err, response) {
        logger.error(err)
        logger.info('GET BALANCE:', response)
    })
}

async function getAccountBalanceProxy(self, data) {
    let query = Query.deserializeBinary(data)
    let result = await cryptoGetBalancePromise(self, query)
    logger.info('RESULT INSIDE:', result)
    let responseData = {}
    // Hedera network unreachable
    if (result.err === 14) {
        return {
            error: 'UNAVAILABLE. Hedera network unreachable.'
        }
    }
    let response = responseToResponseType(result.res)
    responseData = {
        nodePrecheckcode: response
            .getCryptogetaccountbalance()
            .getHeader()
            .getNodetransactionprecheckcode(),
        balance: response.getCryptogetaccountbalance().getBalance(),
        accountID: i.accountStringFromAccountID(
            response.getCryptogetaccountbalance().getAccountid()
        ),
        error: result.err
    }
    return responseData
}

// re-constitute CryptoGetAccountBalanceResponse object from the response object (res) from gRPC callback
function responseToResponseType(res) {
    let r = Response.toObject(true, res)
    logger.info(r)

    let responseHeader = new ResponseHeader()
    responseHeader.setNodetransactionprecheckcode(
        r.cryptogetaccountbalance.header.nodetransactionprecheckcode
    )
    responseHeader.setResponsetype(
        r.cryptogetaccountbalance.header.responsetype
    )
    responseHeader.setCost(r.cryptogetaccountbalance.header.cost)
    responseHeader.setStateproof(r.cryptogetaccountbalance.header.stateproof)

    let accountID = new AccountID()
    let accountid = r.cryptogetaccountbalance.accountid
    if (accountid !== undefined) {
        accountID.setShardnum(accountid.shardnum)
        accountID.setRealmnum(accountid.realmnum)
        accountID.setAccountnum(accountid.accountnum)
    }

    let balance = r.cryptogetaccountbalance.balance

    let c = new CryptoGetAccountBalanceResponse()
    c.setHeader(responseHeader)
    c.setAccountid(accountID)
    c.setBalance(balance)

    let response = new Response()
    response.setCryptogetaccountbalance(c)
    return response
}

async function cryptoGetBalancePromise(self, query) {
    return new Promise((resolve, reject) => {
        self.clientCrypto.cryptoGetBalance(query, (err, res) => {
            if (err) {
                if (err.code === 14) {
                    // network unreachable (UNAVAILABLE, connect failed)
                    let result = { err: err.code, res: null }
                    resolve(result)
                }
                reject(err)
            } else {
                let result = { err, res }
                resolve(result)
            }
        })
    })
}

export { getAccountBalance, getAccountBalanceProxy }
