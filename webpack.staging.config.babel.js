import webpack from 'webpack'
import common from './webpack.common.config.babel'
import merge from 'webpack-merge'
import defaults from './src/defaults'

const globals = defaults['staging']
let globalsStringified = {}
for (var k in globals) {
    if (globals.hasOwnProperty(k)) {
        globalsStringified[k] = JSON.stringify(globals[k])
    }
}

// we want to build our app in production mode,
// but webpack will assume NODE_ENV to be production;
// declaring NODE_ENV=staging before running the app
// will not override this
// so, we need to introduce ENV_NAME
let stagingConfig = {
    mode: 'production',
    plugins: [new webpack.DefinePlugin(globalsStringified)]
}

export default merge(common, stagingConfig)
