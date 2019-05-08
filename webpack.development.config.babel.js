import path from 'path'
import nodeExternals from 'webpack-node-externals'
import WebpackShellPlugin from 'webpack-shell-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default {
    entry: {
        app: './app.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        libraryTarget: 'umd'
    },
    watch: true,
    mode: 'development',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'src/index.html',
                to: 'index.html',
                toType: 'file'
            }
        ]),
        new WebpackShellPlugin({
            onBuildEnd: ['npm run dev:nodemon']
        })
    ],
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this in, __dirname
        __filename: false // and __filename return blank or /
    },
    externals: [nodeExternals()]
}
