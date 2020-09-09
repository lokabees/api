import { port, ip, apiRoot, swagger } from '~/config'
import 's/mongoose'
import express from 's/express'
import api from 'a/'

const processMode =  process.env.NODE_ENV

const server = express(apiRoot, api)
if (processMode !== 'test') {
    server.listen(port, () => {
        console.info('\x1b[1m', `| Server:\x1b[0m http://${ip}:${port}`)
        console.info('\x1b[1m', `| Api:\x1b[0m http://${ip}:${port}${apiRoot}`)
        console.info('\x1b[1m', `| Docs:\x1b[0m http://${ip}:${port}${swagger.url}`)
    })
}

export default server
