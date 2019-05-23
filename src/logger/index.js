import { transports, createLogger, format } from 'winston'

const logger = createLogger({
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()]
})

export default logger
