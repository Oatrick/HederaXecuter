import common from './webpack.common.config.babel'
import merge from 'webpack-merge'

let stagingConfig = {
    mode: 'production'
}

export default merge(common, stagingConfig)
