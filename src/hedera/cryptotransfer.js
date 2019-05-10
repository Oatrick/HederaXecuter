import i from './internal'
import {
    AccountAmount,
    TransferList,
    CryptoTransferTransactionBody
} from './pbnode/CryptoTransfer_pb'
import { TransactionID } from './pbnode/BasicTypes_pb'
import { TransactionBody, Transaction } from './pbnode/Transaction_pb'
import { TransactionResponse } from './pbnode/TransactionResponse_pb'
import logger from '../logger'

// self refers to the instance of Hedera (Hedera object).
// senderAccount refers to the paying account. It is a string delimited by dot.
// recipientAccount refers to the account receiving the payment. It is a string delimited by dot.
// amount is a number, designating the amount that is transferred from senderAccount to recipientAccount.
function cryptoTransfer(self, senderAccount, recipientAccount, amount) {
    if (self.operator === undefined) {
        // operator (e.g. the current account that's paying)
        logger.warn(
            'please set the operator who will pay for this transaction before calling getAccountBalance'
        )
        return
    }
    // node fees will be implemented subsequently
    let fee = 0
    logger.info(
        `transfer ${amount} tinybars from ${senderAccount} to ${recipientAccount}`
    )
    let accountAmountSender = new AccountAmount()
    accountAmountSender.setAccountid(i.accountIDFromString(senderAccount))
    accountAmountSender.setAmount(amount)
    let accountAmountRecipient = new AccountAmount()
    accountAmountRecipient.setAccountid(i.accountIDFromString(recipientAccount))
    accountAmountRecipient.setAmount(amount)
    let transferList = new TransferList()
    transferList.setAccountamountsList([
        accountAmountRecipient,
        accountAmountSender
    ])
    let cryptoTransferTransactionBody = new CryptoTransferTransactionBody()
    cryptoTransferTransactionBody.setTransfers(transferList)

    let txID = new TransactionID()
    txID.setAccountid(i.accountIDFromString(senderAccount))
    txID.setTransactionvalidstart(i.getTimestamp())

    let txBody = new TransactionBody()
    txBody.setTransactionid(txID)
    txBody.setTransactionfee(fee)
    txBody.setTransactionvalidduration(i.getDuration())
    txBody.setGeneraterecord(true)
    txBody.setCryptotransfer(cryptoTransferTransactionBody)
    txBody.setMemo('JavaScript micro-payment transaction')

    let sigList = i.signWithKeys(
        txBody.serializeBinary(),
        self.operator.keypair.priv
    )

    let tx = new Transaction()
    tx.setBody(txBody)
    tx.setSigs(sigList)

    tx.setCryptotransfer(cryptoTransferTransactionBody)

    // make the transaction request
    self.clientCrypto.cryptoTransfer(tx, function(err, response) {
        logger.error(err)
    })
}

async function cryptoTransferProxy(self, data) {
    let tx = Transaction.deserializeBinary(data)
    let result = await cryptoTransferPromise(self, tx)
    let responseData = {}
    // Hedera network unreachable
    if (result.err === 14) {
        let responseData = {
            error: 'UNAVAILABLE. Hedera network unreachable.'
        }
        let tx = null
        return {
            responseData,
            tx
        }
    }
    if (result.err === null) {
        let r = TransactionResponse.toObject(true, result.res)
        responseData = {
            nodePrecheckcode: r.nodetransactionprecheckcode,
            error: null
        }
    } else {
        responseData = {
            nodePrecheckcode: r.nodetransactionprecheckcode,
            error: result.err
        }
    }
    return {
        responseData,
        tx
    }
}

async function cryptoTransferPromise(self, tx) {
    return new Promise((resolve, reject) => {
        self.clientCrypto.cryptoTransfer(tx, (err, res) => {
            if (err) {
                if (err.code === 14) {
                    // network unreachable (UNAVAILABLE, connect failed)
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

export { cryptoTransfer, cryptoTransferProxy }
