import { Router } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { swagger as swaggerConfig } from '~/config'
import { Models } from '~/api'

const specs = swaggerJSDoc(swaggerConfig)
const swagger = new Router()

specs.components.schemas = {}
Models.forEach((model) => {
    specs.components.schemas[model.swaggerSchema.title] = model.swaggerSchema
})

swagger.use(swaggerConfig.url, swaggerUi.serve)
swagger.get(
    swaggerConfig.url,
    swaggerUi.setup(specs, {
        explorer: true
    })
)
export default swagger
