let PORT = 8099 // Payment Server's default express/socketio server will be 8099

// Not using sticky session
// import server from './src/payment-server'
// server.listen(PORT)

// Using sticky session
if(process.env.PORT != undefined){
  PORT = process.env.PORT
}
import server from './src/payment-server-sticky'
import sticky from 'sticky-session'
sticky.listen(server, PORT)
