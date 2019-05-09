import common from './webpack.common.config.babel'
import merge from 'webpack-merge'
import { exec } from 'child_process'

let developmentConfig = {
    mode: 'development',
    devtool: 'source-map',
    watch: true,
    plugins: [
        {
            apply: compiler => {
                compiler.hooks.afterEmit.tap('AfterEmitPlugin', compilation => {
                    exec('npm run dev:debug', (err, stdout, stderr) => {
                        if (stdout) process.stdout.write(stdout)
                        if (stderr) process.stderr.write(stderr)
                    })
                })
            }
        }
    ]
}

export default merge(common, developmentConfig)
