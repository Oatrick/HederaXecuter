import common from './webpack.common.config.babel'
import merge from 'webpack-merge'

let productionConfig = {
    mode: 'production'
}

export default merge(common, productionConfig)
