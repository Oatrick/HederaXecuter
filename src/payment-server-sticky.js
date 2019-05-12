import cluster from 'cluster'
import http from 'http'

import ioServer from 'socket.io'
import redisAdapter from 'socket.io-redis'
import redis from 'redis';
import createServer from './create-server'

let server

// TODO: we can switch out to using config and ENV_NAME to retrieve our REDIS_HOST and REDIS_PASSWORD from our dot env file
// import config from './config'
// let REDIS_HOST = config[ENV_NAME]['REDIS_HOST']
// let REDIS_PASSWORD = config[ENV_NAME]['REDIS_PASSWORD']
let REDIS_HOST = process.env.REDIS_HOST
let REDIS_PASSWORD = process.env.REDIS_PASSWORD
let REDIS_PORT = 6379

if(REDIS_HOST == undefined){
  REDIS_HOST = "localhost"
}

if (cluster.isMaster) {
  server = http.createServer()
  const io = ioServer().listen(server)
  const pub = redis.createClient(REDIS_PORT, REDIS_HOST, { auth_pass: REDIS_PASSWORD });
  const sub = redis.createClient(REDIS_PORT, REDIS_HOST, { auth_pass: REDIS_PASSWORD });
  io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));

  

  cluster.on('exit', (worker, code, signal) => {
    console.log('worker ' + worker.process.pid + ' died')
  })
}

if (cluster.isWorker) {
    server = createServer()
}

export default server
