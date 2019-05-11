import { ContractCallTransactionBody } from './pbnode/ContractCall_pb'
import { TransactionID, SignatureList } from './pbnode/BasicTypes_pb'
import i from './internal'
import { Transaction } from './pbnode/Transaction_pb'
import { TransactionBody } from './pbnode/TransactionBody_pb'
import forge from 'node-forge'
import debug from 'debug'
import { TransactionResponse } from './pbnode/TransactionResponse_pb'
import logger from '../logger'

const log = debug('test:contractcall')

/**
 * contractCall prepares the contractCall object in a protobuf acceptable format to be parsed back.
 * @param {Object} self
 * @param {string} contract
 * @param {string} gas
 * @param {string} amount
 * @param {string} sender
 * @param {Uint8Array | string} functionParams
 * @param {string} memo
 * @param {number} fee
 */
function contractCall(
    self,
    contract,
    gas,
    amount,
    sender,
    functionParams,
    memo,
    fee
) {
    if (self.operator === undefined) {
        // operator (e.g. the current account that's paying the service fee to Hedera nodes)
        throw new Error(
            'please set the operator who will pay for this transaction before calling getAccountBalance'
        )
    }
    // let transferList = setRecipientTransferLists(sender, recipientList)

    let body = new ContractCallTransactionBody()
    body.setContractid(i.contractIDFromString(contract))
    body.setGas(parseInt(gas, 10))
    body.setAmount(parseInt(amount, 10))
    body.setFunctionparameters(functionParams)

    let txID = new TransactionID()
    txID.setAccountid(i.accountIDFromString(sender))
    txID.setTransactionvalidstart(i.getTimestamp())

    log(`fee is ${fee}`)
    let txBody = new TransactionBody()
    txBody.setTransactionid(txID)
    txBody.setTransactionfee(fee)
    txBody.setTransactionvalidduration(i.getDuration())
    txBody.setGeneraterecord(true)
    txBody.setContractcall(body)
    txBody.setNodeaccountid(self.nodeAccountID)
    txBody.setMemo(memo)

    // sign
    let txBodyBytes = txBody.serializeBinary()
    let privateKeyHex = self.operator.keypair.privateKey
    let publicKeyHex = self.operator.keypair.publicKey
    let sig = i.signWithKeyAndVerify(txBodyBytes, privateKeyHex, publicKeyHex)

    let sigList = new SignatureList()
    sigList.setSigsList([sig, sig])

    let tx = new Transaction()
    tx.setBody(txBody)
    // tx.setSigs(sigMain.getSignaturelist())
    tx.setSigs(sigList)
    log('tx body bytes')
    log(tx)
    log(forge.util.bytesToHex(tx.serializeBinary()))
    return tx
}

async function contractCallProxy(self, data) {
    let tx = Transaction.deserializeBinary(data)
    let result = await contractCallMethodPromise(self, tx)
    logger.info('RESULT OF CONTRACT CALL METHOD PROMISE', result)
    logger.info(result.res)
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
        logger.info('r is:', r)
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

async function contractCallMethodPromise(self, tx) {
    return new Promise((resolve, reject) => {
        // IMPORTANT NOTE:
        // there's actually contractCallMethod and contractCallLocalMethod
        // we are only implementing contractCallMethod at the moment
        self.clientContract.contractCallMethod(tx, (err, res) => {
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

export { contractCallProxy }
