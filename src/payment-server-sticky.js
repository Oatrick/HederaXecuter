import cluster from 'cluster'
import http from 'http'

import ioServer from 'socket.io'
import createServer from './create-server'

let server
let io

if (cluster.isMaster) {
    server = http.createServer()
    io = ioServer().listen(server)

    cluster.on('exit', (worker, code, signal) => {
        console.log('worker ' + worker.process.pid + ' died')
    })
}

if (cluster.isWorker) {
    let serverAndIo = createServer()
    server = serverAndIo.server
    io = serverAndIo.io
}

export default { server, io }
