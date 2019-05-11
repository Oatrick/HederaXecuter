const defaults = {}

const productionPaymentServer = {
    ENV_NAME: 'production'
}

const stagingPaymentServer = {
    ENV_NAME: 'staging'
}

const developmentPaymentServer = {
    ENV_NAME: 'development'
}

const testPaymentServer = {
    ENV_NAME: 'test'
}

const production = {
    ...defaults,
    ...productionPaymentServer
}

const staging = {
    ...defaults,
    ...stagingPaymentServer
}

const development = {
    ...defaults,
    ...developmentPaymentServer
}

const test = {
    ...defaults,
    ...testPaymentServer
}

export default { production, staging, development, test }
