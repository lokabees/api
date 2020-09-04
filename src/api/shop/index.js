import { Router } from 'express'
import { middleware as query } from 'querymen'
import { addAuthor } from 's/request'
import { create, index, show, update, destroy, getCategories } from './controller'
import { body } from 'express-validator'
export Shop, { schema } from './model'
// meh
import { category } from "./model";
export const ShopCategory = category
import { facebookValidator, instagramValidator, websiteValidator, cloudinaryValidator, parseOpeningHours, openingHoursValidatorExpress } from '~/utils/validator'
import { expressValidatorErrorChain, onlyAllowMatched } from 's/validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

// workaround to fix import / export issues >:(
const categoryValidator = async (categories, { req, location, path }) => {
    try {
        const dbCategories = (await ShopCategory.find()).map(a => a._id.toString())
        if (categories.every((category) => dbCategories.includes(category))) return true
        throw new Error(req.__(`${path}.validation`))
    } catch (error) {
        throw new Error(req.__(`${path}.validation`))
    }
}


/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Shop management
 */
const router = new Router()

/**
 * @swagger
 * path:
 *  /api/shops/:
 *    post:
 *      summary: Create a new Shop
 *      tags: [Shops]
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
 *          description: A shop schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Shop'
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
    [
        body('name').exists().isString().notEmpty(),
        body('author').exists(),
        body('published').optional().isBoolean(),
        body('description').exists().isString().trim().escape(),
        body('contact.email').optional().normalizeEmail().isEmail(),
        body('contact.instagram')
            .optional()
            .matches(instagramValidator)
            .withMessage((_, { req, location, path }) => req.__(`${path}.validation`)),
        body('contact.website')
            .optional()
            .matches(websiteValidator)
            .withMessage((_, { req, location, path }) => req.__(`${path}.validation`)),
        body('contact.facebook')
            .optional()
            .matches(facebookValidator)
            .withMessage((_, { req, location, path }) => req.__(`${path}.validation`)),
        body('contact.phone').optional().custom((value, { req }) => {
            if (!parsePhoneNumberFromString(value).isValid()) {
                throw new Error(req.__(`${path}.validation`)) 
            }
            return true
        }),
        body('images.*')
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
        // TODO: validation
        body('categories').optional().isArray().custom(categoryValidator),
        body('address.country').exists().isString(),
        body('address.city').exists().isString(),
        body('address.postcode').exists().isString(),
        body('address.street').exists().isString(),
        body('address.number').exists().isString(),
        body('address.optional').optional().isString(),
        body('address.locality').exists().isString(),
        body('address.geometry.type').exists().isString().equals('Point'),
        body('address.geometry.coordinates').exists().isArray().isLength(2),
        body('address.geometry.coordinates.*').isFloat(),
        body('openingHours').exists().custom((value, { req, location, path }) => {
            try {
                req.body.parsedOpeningHours = parseOpeningHours(value)
                delete req.body.openingHours
                // validate
            } catch (error) {
                throw new Error(req.__(`${path}.validation`))
            }
            return true
        }),
        body('parsedOpeningHours').exists().custom(openingHoursValidatorExpress),
        body('delivery').optional().isArray(),
        body('delivery.*').optional().isIn(['MD', 'LD', 'PU'])
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    create
)

// TODO: Pagination docs
/**
 * @swagger
 * path:
 *  /api/shops/:
 *    get:
 *      summary: Get shops
 *      tags: [Shops]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "200":
 *          description: A shop schema array (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.get('/', query(), index)


// TODO: Pagination docs
/**
 * @swagger
 * path:
 *  /api/shops/categories:
 *    get:
 *      summary: Get shop categories
 *      tags: [Shops]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "200":
 *          description: array with shop categories
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */
router.get('/categories', getCategories)

/**
 * @swagger
 * path:
 *  /api/shops/{shopId}:
 *    get:
 *      summary: Get Shop
 *      tags: [Shops]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: shopId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the shop to get
 *      responses:
 *        "200":
 *          description: A shop schema (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Shop not found
 *        "500":
 *          description: Oh boi
 */
router.get('/:id', show)

/**
 * @swagger
 * path:
 *  /api/shops/{shopId}:
 *    put:
 *      summary: Update shop
 *      tags: [Shops]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: shopId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the shop to update
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
 *          description: Shop schema (fields depend on the ACL)
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Shop not found
 *        "500":
 *          description: Oh boi
 */
router.put('/:id',
    [
        body('name').optional().isString().notEmpty(),
        body('published').optional().isBoolean(),
        body('description').optional().isString().trim().escape(),
        body('contact.email').optional().normalizeEmail().isEmail(),
        body('contact.instagram')
            .optional()
            .matches(instagramValidator)
            .withMessage((_, { req, location, path}) => req.__(`${path}.validation`)),
        body('contact.website')
            .optional()
            .matches(websiteValidator)
            .withMessage((_, { req, location, path}) => req.__(`${path}.validation`)),
        body('contact.facebook')
            .optional()
            .matches(facebookValidator)
            .withMessage((_, { req, location, path}) => req.__(`${path}.validation`)),
        body('contact.phone').optional().custom((value, { req }) => {
            if (!parsePhoneNumberFromString(value).isValid()) {
                throw new Error(req.__('contact.phone.validation')) 
            }
            return true
        }),
        body('images.*')
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
        // TODO: validation.
        body('categories').optional().isArray().custom(categoryValidator),
        body('address.country').optional().isString(),
        body('address.city').optional().isString(),
        body('address.postcode').optional().isString(),
        body('address.street').optional().isString(),
        body('address.number').optional().isString(),
        body('address.optional').optional().isString(),
        body('address.locality').optional().isString(),
        body('address.geometry.type').optional().isString().equals('Point'),
        body('address.geometry.coordinates').optional().isArray().isLength(2),
        body('address.geometry.coordinates.*').isFloat(),
        body('openingHours').optional().custom((value, { req, location, path }) => {
            try {
                req.body.parsedOpeningHours = parseOpeningHours(value)
                delete req.body.openingHours
                // validate
            } catch (error) {
                throw new Error(req.__(`${path}.validation`))
            }
            return true
        }),
        body('parsedOpeningHours').optional().custom(openingHoursValidatorExpress),
        body('delivery').optional().isArray(),
        body('delivery.*').optional().isIn(['MD', 'LD', 'PU'])
    ],
    onlyAllowMatched,
    expressValidatorErrorChain,
    update
)

/**
 * @swagger
 * path:
 *  /api/shops/{shopId}:
 *    delete:
 *      summary: Delete shop
 *      tags: [Shops]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: shopId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the shop to delete
 *      responses:
 *        "204":
 *          description: Successfully deleted shop
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Shop not found
 *        "500":
 *          description: Oh boi
 */
router.delete('/:id', destroy)

export default router
