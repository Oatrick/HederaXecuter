import webpack from 'webpack'
import common from './webpack.common.config.babel'
import merge from 'webpack-merge'
import defaults from './src/defaults'

const globals = defaults['production']
let globalsStringified = {}
for (var k in globals) {
    if (globals.hasOwnProperty(k)) {
        globalsStringified[k] = JSON.stringify(globals[k])
    }
}

let productionConfig = {
    mode: 'production',
    plugins: [new webpack.DefinePlugin(globalsStringified)]
}

export default merge(common, productionConfig)
