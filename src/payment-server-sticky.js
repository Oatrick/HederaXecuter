import cluster from 'cluster'
import http from 'http'

import ioServer from 'socket.io'
import createServer from './create-server'

let server

if (cluster.isMaster) {
    // TODO: we should not need this at all
    server = http.createServer()
    const io = ioServer().listen(server)

    cluster.on('exit', (worker, code, signal) => {
        console.log('worker ' + worker.process.pid + ' died')
    })
}

if (cluster.isWorker) {
    server = createServer()
}

export default server
