// Payment Server's default express/socketio server will be 8099

// Not using sticky session
// import server from './src/payment-server'
// server.listen(PORT)

// Using sticky session
import server from './src/payment-server-sticky'
import sticky from 'sticky-session'

let PORT = 8099

if(process.env.PORT != undefined){
  PORT = process.env.PORT
}

sticky.listen(server, PORT)
