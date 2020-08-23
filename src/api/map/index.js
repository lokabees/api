import { Router } from 'express'
import { suggest } from './controller'

/**
 * @swagger
 * tags:
 *   name: Maps
 *   description: Map management
 */
const router = new Router()

/**
 * @swagger
 * path:
 *  /api/maps/suggest:
 *    get:
 *      summary: Get mapbox place suggestion for germany. https://docs.mapbox.com/help/how-mapbox-works/geocoding/
 *      tags: [Maps]
 *      parameters:
 *         - in: query
 *           name: q
 *           schema:
 *             type: string
 *           description: 'The search string. Preffered Format: Street Nr, Postcode City.'
 *      responses:
 *        "200":
 *          description: Suggestions
 *        "400":
 *          description: Invalid Body
 *        "500":
 *          description: Oh boi
 */
// TODO: express-validator for query
router.get(
    '/suggest',
    suggest
)

export default router
