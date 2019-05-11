import cluster from 'cluster'
import http from 'http'

import ioServer from 'socket.io'
import redis from 'socket.io-redis'

import createServer from './create-server'

let server

if (cluster.isMaster) {
    server = http.createServer()
    const io = ioServer().listen(server)
    const redisServer = redis({ host: 'localhost', port: 6379 })
    io.adapter(redisServer)

    cluster.on('exit', (worker, code, signal) => {
        console.log('worker ' + worker.process.pid + ' died')
    })
}

if (cluster.isWorker) {
    server = createServer()
}

export default server
