// temporarily hardcoded values.
// This will be replaced with a function that produces the same exact values
// parsing out gRPC objects via getFileContent.
export default {
    production: {
        ADDRESS_BOOK: [
            {
                '0.0.3': '35.237.200.180:50211'
            },
            {
                '0.0.4': '35.186.191.247:50211'
            },
            {
                '0.0.5': '35.192.2.25:50211'
            },
            {
                '0.0.6': '35.199.161.108:50211'
            },
            {
                '0.0.7': '35.203.82.240:50211'
            },
            {
                '0.0.8': '35.236.5.219:50211'
            },
            {
                '0.0.9': '35.197.192.225:50211'
            },
            {
                '0.0.10': '35.242.233.154:50211'
            },
            {
                '0.0.11': '35.240.118.96:50211'
            },
            {
                '0.0.12': '35.204 .86 .32: 50211'
            }
        ]
    },
    staging: {
        ADDRESS_BOOK: [
            {
                '0.0.3': 'testnet.hedera.com:50006'
            }
        ]
    },
    development: {
        ADDRESS_BOOK: [
            {
                '0.0.3': 'testnet.hedera.com:50006'
            }
        ]
    },
    test: {
        ADDRESS_BOOK: [
            {
                '0.0.3': 'testnet.hedera.com:50006'
            }
        ]
    }
}
