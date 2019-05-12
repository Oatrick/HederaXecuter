import cluster from 'cluster'
import http from 'http'

import ioServer from 'socket.io'
import redis from 'socket.io-redis'

import createServer from './create-server'

let server

// TODO: we can switch out to using config and ENV_NAME to retrieve our REDIS_HOST and REDIS_PASSWORD from our dot env file
// import config from './config'
// let REDIS_HOST = config[ENV_NAME]['REDIS_HOST']
// let REDIS_PASSWORD = config[ENV_NAME]['REDIS_PASSWORD']
let REDIS_HOST = process.env.REDIS_HOST
let REDIS_PASSWORD = process.env.REDIS_PASSWORD

if (REDIS_HOST == undefined) {
    REDIS_HOST = 'localhost'
}
if (cluster.isMaster) {
    server = http.createServer()
    const io = ioServer().listen(server)

    const redisServer = redis({ host: REDIS_HOST, port: 6379 })
    io.adapter(redisServer)

    cluster.on('exit', (worker, code, signal) => {
        console.log('worker ' + worker.process.pid + ' died')
    })
}

if (cluster.isWorker) {
    server = createServer()
}

export default server
