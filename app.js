import server from './src/payment-server'

const PORT = 8099 // we set our micropayment's socketio server to use port 8099
server.listen(PORT)
