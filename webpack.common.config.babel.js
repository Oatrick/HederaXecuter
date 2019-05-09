import path from 'path'
import nodeExternals from 'webpack-node-externals'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'

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
        new CleanWebpackPlugin()
    ],
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this in, __dirname
        __filename: false // and __filename return blank or /
    },
    externals: [nodeExternals()]
}
