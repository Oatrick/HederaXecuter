# Micropayment Server

This Micropayment Server is an open source demo application that helps content publishers monetize their work easily.

It implements a socketio server that listens to `CRYPTOTRANSFER` (socketio) event from `hedera-browser-extension`; and receives a signed CryptoTransfer transaction object from `hedera-browser-extension`. On receipt of the signed transaction object, it proxies the transaction object to a node in Hedera Network via a gRPC network call.

The gRPC response from Hedera Network will then be handled and _pushed back_ to listening socketio clients via the `CRYPTOTRANSFER_RESPONSE` event.

## Technology Stack

This Micropayment Server can be implemented in any language.

For purposes of this demo, it has been implemented in expressJS/NodeJS.

## Set Up

```
# node dependencies
npm install
# set up config/index.js by using the sample config/index.js.sample as reference
```
