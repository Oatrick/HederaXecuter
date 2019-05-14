import webpack from 'webpack'
import common from './webpack.common.config.babel'
import merge from 'webpack-merge'
import { exec } from 'child_process'
import defaults from './src/defaults'

const globals = defaults['development']
let globalsStringified = {}
for (var k in globals) {
    if (globals.hasOwnProperty(k)) {
        globalsStringified[k] = JSON.stringify(globals[k])
    }
}

let developmentConfig = {
    mode: 'development',
    devtool: 'source-map',
    watch: true,
    plugins: [new webpack.DefinePlugin(globalsStringified)]
}

export default merge(common, developmentConfig)
