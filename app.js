// Using sticky session
import serverAndIo from './src/payment-server-sticky'
import sticky from 'sticky-session'
import logger from './src/logger'

let PORT = 8099
let server = serverAndIo.server
let io = serverAndIo.io

if (process.env.PORT != undefined) {
    PORT = process.env.PORT
}

sticky.listen(server, PORT)

// handle graceful shutdown of http server and socketio server
const handle = signal => {
    logger.info(`Received ${signal}`)
    logger.info('Closing http server')
    server.close(() => {
        logger.info('Http Server closed')
    })
    io.close(() => {
        logger.info('SocketIO Server closed')
    })
    process.exit()
}

// https://qph.fs.quoracdn.net/main-qimg-1180ef2465c309928b02481f02580c6a
// SIGINT is <Ctrl>+C in terminal
process.on('SIGINT', handle)
// SIGTERM is a termination request sent to our program
process.on('SIGTERM', handle)
