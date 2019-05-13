import dotenvFlow from 'dotenv-flow'

// ENV_NAME is a global variable created by webpack
// it takes the values 'production', 'staging', 'development' or 'test'
const dotenvConfig = dotenvFlow.config({
    node_env: ENV_NAME
}).parsed

// we created this config object for backward compatibility, so all other js modules can still import config
const config = {
    [ENV_NAME]: dotenvConfig
}

export default config
