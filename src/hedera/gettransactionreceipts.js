import { Query } from './pbnode/Query_pb'
import {
    TransactionGetReceiptQuery,
    TransactionGetReceiptResponse
} from './pbnode/TransactionGetReceipt_pb'
import { QueryHeader, ResponseType } from './pbnode/QueryHeader_pb'
import { TransactionBody, Transaction } from './pbnode/Transaction_pb'
import { Response } from './pbnode/Response_pb'
import { ResponseHeader } from './pbnode/ResponseHeader_pb'
import { TransactionReceipt } from './pbnode/TransactionReceipt_pb'
import i from './internal'
import { ResponseCodeEnum } from './pbnode/ResponseCode_pb'
import { AccountID, FileID, ContractID } from './pbnode/BasicTypes_pb'

// txID is the transaction ID that we are asking receipt for
function getTransactionReceipts(self, txID) {
    console.log('getTransactionReceipts')

    let txBody = new TransactionBody()
    txBody.setTransactionid(txID)
    txBody.setTransactionfee(0) // getTransactionReceipts is free
    txBody.setTransactionvalidduration(i.getDuration())

    let sigList = i.signWithKeys(
        txBody.serializeBinary(),
        self.operator.keypair.priv
    )

    let tx = new Transaction()
    tx.setBody(txBody)
    tx.setSigs(sigList)

    let qHeader = new QueryHeader()
    qHeader.setPayment(tx)
    qHeader.setResponsetype(ResponseType.ANSWER_ONLY)

    let transactionGetReceiptQuery = new TransactionGetReceiptQuery()
    transactionGetReceiptQuery.setHeader(qHeader)
    transactionGetReceiptQuery.setTransactionid(txID)

    let q = new Query()
    q.setTransactiongetreceipt(transactionGetReceiptQuery)

    // make the request
    self.clientCrypto.getTransactionReceipts(q, function(err, res) {
        console.log(err)
        console.log('Get Transaction Receipt', res)
    })
}

async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms))
}

async function getTransactionReceiptsProxy(self, data, retries = 10) {
    let q = Query.deserializeBinary(data)

    // first grpc call to Hedera network
    let result = await getTransactionReceiptsPromise(self, q)
    // if (result.err === 14) {
    //   return {
    //     error: 'UNAVAILABLE. Hedera network unreachable.'
    //   }
    // }
    let response = getTxReceiptsResponseType(result.res)
    let responseData = prepareResponseData(response)
    let noConsensusYet = responseData.receiptStatus === ResponseCodeEnum.UNKNOWN

    // retry, with a delay of 3000 ms
    while (noConsensusYet || retries > 0) {
        delay(3000)
        result = await getTransactionReceiptsPromise(self, q)
        response = getTxReceiptsResponseType(result.res)
        responseData = prepareResponseData(response)
        noConsensusYet = responseData.receiptStatus === ResponseCodeEnum.UNKNOWN
        retries = retries - 1
    }

    // console.log('responseData:', responseData)
    return responseData
}

function prepareResponseData(response) {
    let nodePrecheckcode = response
        .getTransactiongetreceipt()
        .getHeader()
        .getNodetransactionprecheckcode()
    let receiptStatus = response
        .getTransactiongetreceipt()
        .getReceipt()
        .getStatus()
    let receiptAccountID = i.accountStringFromAccountID(
        response
            .getTransactiongetreceipt()
            .getReceipt()
            .getAccountid()
    )
    let receiptFileID = i.fileStringFromFileID(
        response
            .getTransactiongetreceipt()
            .getReceipt()
            .getFileid()
    )
    let receiptContractID = i.contractStringFromContractID(
        response
            .getTransactiongetreceipt()
            .getReceipt()
            .getContractid()
    )
    return {
        nodePrecheckcode,
        receiptStatus,
        receiptAccountID,
        receiptFileID,
        receiptContractID
    }
}

function getTxReceiptsResponseType(res) {
    let r = Response.toObject(true, res)
    console.log('r', r)
    let responseHeader = new ResponseHeader()
    responseHeader.setNodetransactionprecheckcode(
        r.transactiongetreceipt.header.nodetransactionprecheckcode
    )
    responseHeader.setResponsetype(r.transactiongetreceipt.header.responsetype)
    responseHeader.setCost(r.transactiongetreceipt.header.cost)
    responseHeader.setStateproof(r.transactiongetreceipt.header.stateproof)

    let txReceipt = new TransactionReceipt()
    if (r.transactiongetreceipt.receipt !== undefined) {
        if (r.transactiongetreceipt.receipt.status !== undefined) {
            txReceipt.setStatus(r.transactiongetreceipt.receipt.status)
        }
    }

    let accountID = new AccountID()
    if (r.transactiongetreceipt.receipt !== undefined) {
        if (r.transactiongetreceipt.receipt.accountid !== undefined) {
            accountID.setShardnum(
                r.transactiongetreceipt.receipt.accountid.shardnum
            )
            accountID.setRealmnum(
                r.transactiongetreceipt.receipt.accountid.realmnum
            )
            accountID.setAccountnum(
                r.transactiongetreceipt.receipt.accountid.accountnum
            )
        }
        txReceipt.setAccountid(accountID)
    }

    let fileID = new FileID()
    if (r.transactiongetreceipt.receipt !== undefined) {
        if (r.transactiongetreceipt.receipt.fileid !== undefined) {
            fileID.setShardnum(r.transactiongetreceipt.receipt.fileid.shardnum)
            fileID.setRealmnum(r.transactiongetreceipt.receipt.fileid.realmnum)
            fileID.setAccountnum(r.transactiongetreceipt.receipt.fileid.filenum)
        }
        txReceipt.setFileid(fileID)
    }

    let contractID = new ContractID()
    if (r.transactiongetreceipt.receipt !== undefined) {
        if (r.transactiongetreceipt.receipt.contractid !== undefined) {
            contractID.setShardnum(
                r.transactiongetreceipt.receipt.contractid.shardnum
            )
            contractID.setRealmnum(
                r.transactiongetreceipt.receipt.contractid.realmnum
            )
            contractID.setAccountnum(
                r.transactiongetreceipt.receipt.contractid.contractnum
            )
        }
        txReceipt.setContractid(contractID)
    }

    let c = new TransactionGetReceiptResponse()
    c.setHeader(responseHeader)
    c.setReceipt(txReceipt)

    let response = new Response()
    response.setTransactiongetreceipt(c)
    return response
}

async function getTransactionReceiptsPromise(self, query) {
    return new Promise((resolve, reject) => {
        self.clientCrypto.getTransactionReceipts(query, (err, res) => {
            if (err) {
                if (err.code === 14) {
                    let result = {
                        err: err.code,
                        res: null
                    }
                    resolve(result)
                }
                reject(err)
            } else {
                let result = {
                    err,
                    res
                }
                resolve(result)
            }
        })
    })
}

export {
    getTransactionReceipts,
    getTransactionReceiptsProxy,
    getTxReceiptsResponseType
}
