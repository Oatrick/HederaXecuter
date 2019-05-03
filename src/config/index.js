export default {
    production: {
        NODE_ADDRESS: '35.237.200.180:50211',
        NODE_ACCOUNT: '0.0.3',
        MICROPAYMENT_SERVER: 'https://mps.dailytimestamp.com',
        PUBLISHER_SERVER: 'https://dailytimestamp.com',
        PORTAL: 'https://api.portal.hedera.com'
    },
    staging: {
        NODE_ADDRESS: 'testnet.hedera.com:50003',
        NODE_ACCOUNT: '0.0.3',
        MICROPAYMENT_SERVER: 'https://mps.thetimesta.mp',
        PUBLISHER_SERVER: 'http://thetimesta.mp',
        PORTAL: 'https://api.dev.portal.hedera.com',
        PORTAL_TOKEN: ''
    },
    development: {
        NODE_ADDRESS: 'testnet.hedera.com:50003',
        NODE_ACCOUNT: '0.0.3',
        MICROPAYMENT_SERVER: 'http://localhost:8099',
        // PUBLISHER_SERVER: 'http://localhost:8101', dailytimestamp with expressjs/nodejs
        PUBLISHER_SERVER: 'http://localhost:8080', // wordpress
        PUBLISHER_API_POST: '/?rest_route=/hedera-micropayment/v1/hello',
        PUBLISHER_API_SECRET: ''
    },
    test: {
        NODE_ADDRESS: '35.237.130.140:50211',
        NODE_ACCOUNT: '0.0.3',
        MICROPAYMENT_SERVER: 'http://localhost:9099',
        PUBLISHER_API_POST: '/?rest_route=/hedera-micropayment/v1/hello',
        PUBLISHER_API_SECRET: '',
        PUBLISHER_SERVER: 'http://localhost:9001',
        PORTAL: 'http://localhost:9001',
        PORTAL_TOKEN: 'somerandomtoken'
    },
    mock: {
        NODE_ADDRESS: 'http://localhost:8100',
        NODE_ACCOUNT: '0.0.3',
        MICROPAYMENT_SERVER: 'http://localhost:8099',
        PUBLISHER_SERVER: 'http://localhost:8101'
    }
}
