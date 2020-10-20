import { Router } from 'express'
import { middleware as query } from 'querymen'
import { addAuthor, addShop } from 's/request'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
import { expressValidatorErrorChain, onlyAllowMatched } from 's/validator'
import { body } from 'express-validator'
import { cloudinaryValidator } from '~/utils/validator'

export Product, { schema } from './model'

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */
const router = new Router()

/**
 * @swagger
 * path:
 *  /api/products/:
 *    post:
 *      summary: Create a new Product
 *      tags: [Products]
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
 *          description: A product schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.post(
    '/',
    addAuthor({ required: true, addBody: true }),
    addShop({ required: true, addBody: true }),
    [
        body('title').exists().isString().notEmpty(),
        body('description').exists().isString().notEmpty(),
        body('category').exists().isString().notEmpty(),
        body('shop').exists(),
        body('author').exists(),
        body('picture')
            .exists()
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
    create
)

// TODO: Pagination docs
/**
 * @swagger
 * path:
 *  /api/products/:
 *    get:
 *      summary: Get products
 *      tags: [Products]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "200":
 *          description: A product schema array (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.get('/', query(), index)

/**
 * @swagger
 * path:
 *  /api/products/{productId}:
 *    get:
 *      summary: Get Product
 *      tags: [Products]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the product to get
 *      responses:
 *        "200":
 *          description: A product schema (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Product not found
 *        "500":
 *          description: Oh boi
 */
router.get('/:id', show)

/**
 * @swagger
 * path:
 *  /api/products/{productId}:
 *    put:
 *      summary: Update product
 *      tags: [Products]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the product to update
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
 *        "200":
 *          description: Product schema (fields depend on the ACL)
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Product not found
 *        "500":
 *          description: Oh boi
 */
router.put('/:id',
    addAuthor({ required: true, addBody: true }),
    addShop({ required: true, addBody: true }),
    [
        body('title').optional().isString().notEmpty(),
        body('description').optional().isString().notEmpty(),
        body('shop').exists(),
        body('author').exists(),
        body('category').optional().isString().notEmpty(),
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
 *  /api/products/{productId}:
 *    delete:
 *      summary: Delete product
 *      tags: [Products]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the product to delete
 *      responses:
 *        "204":
 *          description: Successfully deleted product
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Product not found
 *        "500":
 *          description: Oh boi
 */
router.delete('/:id', destroy)

export default router
