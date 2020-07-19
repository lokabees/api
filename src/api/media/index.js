import { Router } from 'express'
import { create, destroy } from './controller'

/**
 * @swagger
 * tags:
 *   name: media
 *   description: Media management
 */
const router = new Router()

/**
 * @swagger
 * path:
 *  api/media/:
 *    post:
 *      summary: Create a new Media
 *      tags: [media]
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
 *          description: A media schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Media'
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.post(
    '/:folder',
    create
)

/**
 * @swagger
 * path:
 *  api/media/{mediaId}:
 *    delete:
 *      summary: Delete media
 *      tags: [media]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: mediaId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the media to delete
 *      responses:
 *        "204":
 *          description: Successfully deleted media
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Media not found
 *        "500":
 *          description: Oh boi
 */
router.delete('/:folder/:id', destroy)

export default router
