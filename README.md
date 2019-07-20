# Example Micropayment Payment Server

This is an example Payment Server for the [Hedera Hashgraph](https://hedera.com/) public network. It acts as a payment gateway, allowing developers to more easily monetize of any type of content on the web via micropayments.

## Background

Hedera's example payment server was originally built for Hedera's community testing program, alongside example mobile wallets ([iOS](https://github.com/hashgraph/hedera-wallet-ios), [Android](https://github.com/hashgraph/hedera-wallet-android)), a [WordPress plugin](https://github.com/hashgraph/hedera-micropayment), and a [chrome browser extension](https://github.com/hashgraph/hedera-browser-extension).

You can read a [technical deep dive on Hedera's community testing program](https://www.hedera.com/blog/a-technical-deep-dive-hederas-community-testing-program), which this payment server was initially built for, written by [Calvin Cheng](https://github.com/calvinchengx), if you're curious to learn more.

## How it works

We implemented a socketio based server that listens to a socketio event, in this case a `CRYPTOTRANSFER` from our [Hedera Browser Extension](https://github.com/hashgraph/hedera-browser-extension).

Next it will receive a cryptographically signed CryptoTransfer transaction object passed from the [Hedera Browser Extension](https://github.com/hashgraph/hedera-browser-extension).

On receipt of the signed transaction object from the [Hedera Browser Extension](https://github.com/hashgraph/hedera-browser-extension), this payment server will then proxy the transaction object to a node in Hedera Network, via a gRPC network call.

The [gRPC](https://www.grpc.io/faq/) response from Hedera Network will then be handled and _pushed back_ to listening socketio clients via the `CRYPTOTRANSFER_RESPONSE` event, in our example's case, a WordPress website and plugin.

## Technology Stack

While this Payment Server could be implemented in any language of your choosing, for our purposes, we choose to implement with [node.js](https://nodejs.org/en/) using the very popular [express.js](https://expressjs.com/) framework.

It also uses [socket.io](https://socket.io/) for persistent connections between the [Hedera Browser Extension](https://github.com/hashgraph/hedera-browser-extension), this payment server, and clients wishing to interact with both.

Hedera Hashgraph's APIs are [implemented in protobufs](https://github.com/hashgraph/hedera-protobuf) are [used in this project](/src/hedera/pbnode/), which you can learn more about [here](https://developers.google.com/protocol-buffers/).

## Set Up

```
# node dependencies
npm install
# set up config/index.js by using the sample config/index.js.sample as reference
```

## How to get involved

Hedera welcomes open source contributions to this respotitory, but please file an issue and discuss the improvements with one of the maintainers before beginning work.

We also suggest joining Hedera's [Discord](https://discordapp.com/invite/FFb9YFX) or [Telegram](https://t.me/hederahashgraph) chats, if you haven't already!

To learn more, visit Hedera Hashgraph's documentation at [docs.hedera.com](https://docs.hedera.com).
