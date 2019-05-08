import common from './webpack.common.config.babel'
import merge from 'webpack-merge'
import WebpackShellPlugin from 'webpack-shell-plugin'

let developmentConfig = {
    mode: 'development',
    devtool: 'source-map',
    watch: true,
    plugins: [
        new WebpackShellPlugin({
            onBuildEnd: ['npm run dev:nodemon']
        })
    ]
}

export default merge(common, developmentConfig)
