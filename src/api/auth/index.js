import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate, providerAuthenticate, logout, logoutAll } from './controller'
import { masterman } from '~/services/auth'
import { expressValidatorErrorChain, onlyAllowMatched } from 's/validator'
import { passwordValidator } from '~/utils/validator'

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authenticate a user
 */
const router = new Router()

/**
 * @swagger
 * path:
 *  /api/auth/:
 *    post:
 *      summary: Login
 *      tags: [Authentication]
 *      security:
 *        - masterKey: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                password:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  role:
 *                    type: string
 *                  token:
 *                    type: string
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey, wrong password/email combination or email not verified
 *        "403":
 *          description: Missing permissions (ACL)
 *        "500":
 *          description: Oh boi
 */
router.post(
    '',
    masterman(),
    [
        body('email').exists().normalizeEmail().isEmail(),
        body('password')
            .exists()
            .matches(passwordValidator)
            .withMessage((_, { req, location, path }) => req.__(`${path}.validation`)),
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    authenticate
)

/**
 * @swagger
 * path:
 *  /api/auth/logout:
 *    post:
 *      summary: Logout the current session
 *      tags: [Authentication]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "204":
 *          description: Success
 *        "400":
 *          description: Token missing
 *        "500":
 *          description: Oh boi
 */
router.post('/logout', logout)

/**
 * @swagger
 * path:
 *  /api/auth/logout/all:
 *    post:
 *      summary: Logout all sessions which are associated with the user
 *      tags: [Authentication]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "204":
 *          description: Success
 *        "400":
 *          description: Token missing
 *        "500":
 *          description: Oh boi
 */
router.post('/logout/all', logoutAll)

/**
 * @swagger
 * path:
 *  /api/auth/{provider}:
 *    post:
 *      summary: Login with 3rd party
 *      tags: [Authentication]
 *      parameters:
 *        - in: path
 *          name: provider
 *          schema:
 *            type: string
 *            enum: [facebook, google]
 *          required: true
 *          description: 3rd party provider name
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  role:
 *                    type: string
 *                  token:
 *                    type: string
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey
 *        "403":
 *          description: Missing permissions (user or password wrong or user is not verified)
 *        "500":
 *          description: Oh boi
 */
router.post(
    '/:provider',
    [
        body('accessToken')
            .exists()
            .isString()
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    providerAuthenticate
)

export default router
