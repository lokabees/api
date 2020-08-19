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
 *  /api/maps/:
 *    post:
 *      summary: Create a new Map
 *      tags: [Maps]
 *      security:
 *        - jwtSessionToken: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                content:
 *                  type: string
 *      responses:
 *        "201":
 *          description: A map schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Map'
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.get(
    '/suggest',
    suggest
)

export default router
