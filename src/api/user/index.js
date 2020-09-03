import { Router } from 'express'
import { middleware as query } from 'querymen'
import { body } from 'express-validator'
import { masterman } from 's/auth'
import { schema } from './model'
import { passwordValidator } from '~/utils/validator'
import { expressValidatorErrorChain, onlyAllowMatched } from 's/validator'
export User, { schema } from './model'

import {
    index,
    show,
    create,
    update,
    updatePassword,
    destroy,
    getActiveShop,
    getShops,
    setActiveShop
} from './controller'

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

const router = new Router()
// TODO: Pagination docs
/**
 * @swagger
 * path:
 *  /api/users/:
 *    get:
 *      summary: Get users
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "200":
 *          description: A user schema array (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.get('/', query(), index)

/**
 * @swagger
 * path:
 *  /api/users/{userId}:
 *    get:
 *      summary: Get user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to get or 'me' to get the current user
 *      responses:
 *        "200":
 *          description: A user schema (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.get('/:id', show)

/**
 * @swagger
 * path:
 *  /api/users/{userId}/shops:
 *    get:
 *      summary: Get user shops
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user
 *      responses:
 *        "200":
 *          description: array with shop ids
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.get('/:id/shops', getShops)

/**
 * @swagger
 * path:
 *  /api/users/{userId}/shops/active:
 *    get:
 *      summary: Get active user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user
 *      responses:
 *        "200":
 *          description: A shop schema (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.get('/:id/shops/active', getActiveShop)

/**
 * @swagger
 * path:
 *  /api/users/{userId}/shops/active:
 *    put:
 *      summary: set active shop
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user
 *      responses:
 *        "200":
 *          description: OK
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User/Shop not found
 *        "500":
 *          description: Oh boi
 */
router.put('/:id/shops/active',
    [
        body('shop').exists().isString(),
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    setActiveShop
)

/**
 * @swagger
 * path:
 *  /api/users/:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      security:
 *        - masterKey: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        "201":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.post(
    '/',
    masterman(),
    [
        body('name').exists().isString().notEmpty(),
        body('email').exists().normalizeEmail().isEmail(),
        body('password')
            .exists()
            .matches(passwordValidator)
            .withMessage((_, { req, location, path }) => req.__(`${path}.validation`)),
        body('picture')
            .optional()
            .custom((value, { req, location, path }) => {
                if (value.url === undefined || value.id === undefined) {
                    throw new Error(req.__(`${path}.validation`))
                }
                const match = value.url.match(cloudinaryValidator)
                if (match === null || value.id !== match[4]) {
                    throw new Error(req.__(`${path}.validation`))
                }
                return true
        }),
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    create
)

/**
 * @swagger
 * path:
 *  /api/users/{userId}:
 *    put:
 *      summary: Update user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to update
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                picture:
 *                  type: string
 *                  format: uri
 *      responses:
 *        "200":
 *          description: User schema (fields depend on the ACL)
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.put('/:id', 
    [
        body('name').optional().isString().notEmpty(),
        body('picture')
            .optional()
            .custom((value, { req, location, path }) => {
                if (value.url === undefined || value.id === undefined) {
                    throw new Error(req.__(`${path}.validation`))
                }
                const match = value.url.match(cloudinaryValidator)
                if (match === null || value.id !== match[4]) {
                    throw new Error(req.__(`${path}.validation`))
                }
                return true
        })
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    update
)

/**
 * @swagger
 * path:
 *  /api/users/{userId}/password:
 *    put:
 *      summary: Update user password
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to update
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                password:
 *                  type: string
 *      responses:
 *        "204":
 *          description: Successful update
 *        "400":
 *          description: Password doesn't match the requirements
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.put('/:id/password',
    [
        body('password')
            .optional()
            .matches(passwordValidator)
            .withMessage((_, { req, location, path }) => req.__(`${path}.validation`)),
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    updatePassword
)

/**
 * @swagger
 * path:
 *  /api/users/{userId}:
 *    delete:
 *      summary: Delete user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to delete
 *      responses:
 *        "204":
 *          description: Successfully deleted user
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */
router.delete('/:id', destroy)

export default router


// TODO: Add user shop management stuff