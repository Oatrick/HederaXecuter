// import i from './internal'
// import {
//     AccountAmount,
//     TransferList,
//     CryptoTransferTransactionBody
// } from './pbnode/CryptoTransfer_pb'
// import { TransactionID } from './pbnode/BasicTypes_pb'
// import { TransactionBody, Transaction } from './pbnode/Transaction_pb'
// import { TransactionResponse } from './pbnode/TransactionResponse_pb'
// import logger from '../logger'

// // self refers to the instance of Hedera (Hedera object).
// // senderAccount refers to the paying account. It is a string delimited by dot.
// // recipientAccount refers to the account receiving the payment. It is a string delimited by dot.
// // amount is a number, designating the amount that is transferred from senderAccount to recipientAccount.
// async function cryptoTransferProxy(self, data) {
//     let tx = Transaction.deserializeBinary(data)
//     console.log("Harlow", tx, tx instanceof Transaction)

//     let result = await cryptoTransferPromise(self, tx)
//     let responseData = {}
//     // Hedera network unreachable
//     if (result.err === 14) {
//         let responseData = {
//             error: 'UNAVAILABLE. Hedera network unreachable.'
//         }
//         let tx = null
//         return {
//             responseData,
//             tx
//         }
//     }
//     if (result.err === null) {
//         let r = TransactionResponse.toObject(true, result.res)
//         responseData = {
//             nodePrecheckcode: r.nodetransactionprecheckcode,
//             error: null
//         }
//     } else {
//         responseData = {
//             nodePrecheckcode: r.nodetransactionprecheckcode,
//             error: result.err
//         }
//     }
//     return {
//         responseData,
//         tx
//     }
// }

// async function cryptoTransferPromise(self, tx) {
//     return new Promise((resolve, reject) => {
    //  //for some strange reason, this tx is always false
//         console.log("HELLLOOO", tx instanceof Transaction)
//         self.clientCrypto.cryptoTransfer(tx, (err, res) => {
//             if (err) {
//                 console.log("WHAT IS THE ERROR", err)
//                 if (err.code === 14) {
//                     // network unreachable (UNAVAILABLE, connect failed)
//                     let result = {
//                         err: err.code,
//                         res: null
//                     }
//                     resolve(result)
//                 }
//                 console.log("WHAT IS THE ERROR1", err)
//                 reject(err)
//             } else {
//                 let result = {
//                     err,
//                     res
//                 }
//                 console.log("THE RESULT HERE IS ", result)
//                 resolve(result)
//             }
//         })
//     })
// }

// export { cryptoTransferProxy }
