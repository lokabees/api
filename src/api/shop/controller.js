import { Shop } from '.'
import { OK, NOT_FOUND, CREATED, FORBIDDEN, NO_CONTENT, BAD_REQUEST } from 'http-status-codes'
import { errorHandler } from 's/response'
import { isObjectId } from '~/utils/validator'
import { category as ShopCategory } from './model'
import circleToPolygon from 'circle-to-polygon'
import { decode } from 'ngeohash'

import { Product } from 'a/product'
// Get all
export const index = async ({ querymen, user, method }, res, next) => {
    try {

        if (user?.role !== 'admin') { // If user is not admin we only want to show the published shops
            querymen.query.published = true
        }

        const shops = await Shop.paginate(querymen, {
            populate: [{ path: 'author' }],
            method,
            user
        })

        res.status(OK).json(shops)
    } catch (error) {
        errorHandler(res, error)
    }
}

export const getNear = async ({ querymen, user, method, params }, res, next) => {
    try {
        
        const { geohash } = params
        if (!geohash) {
            res.status(BAD_REQUEST).end()
            return
        }
        const { latitude, longitude } = decode(geohash)

        if (!latitude || !longitude) {
            res.status(BAD_REQUEST).end()
            return
        }

        if (user?.role !== 'admin') {
            querymen.query.published = true
        }

        querymen.query['address.geometry'] = {
            $geoIntersects: {
                $geometry: circleToPolygon([longitude, latitude], 20000, 32),
            }
        }

        const shops = await Shop.paginate(querymen, {
            populate: [{ path: 'author' }],
            method,
            user
        })

        res.status(OK).json(shops)
    } catch (error) {
        errorHandler(res, error)
    }
}

// Get all
export const getCategories = async (req, res, next) => {
    try {
        const categories = await ShopCategory.find().sort({ name: 1 }).lean()
        const obj = Object.fromEntries(categories.map(e => [e._id, e.name]))
        res.status(OK).json(obj)
    } catch (error) {
        errorHandler(res, error)
    }
}

// Get One
export const show = async ({ params: { id }, method, user }, res, next) => {
    try {
        // id could be _id or slug
        const shop = isObjectId(id) ? 
            await Shop.findById(id).populate('author') :
            await Shop.findOne({ slug: id }).populate('author')

        if (!shop || !shop.published && !Shop.isOwner(shop, user)) {
            res.status(NOT_FOUND).end()
            return
        }

        res.status(OK).json(shop.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Get all
export const getProducts = async ({ params: { id}, querymen, user, method }, res, next) => {
    try {
        querymen.query.shop = id
        const products = await Product.paginate(querymen, {
            populate: [{ path: 'author' }],
            method,
            user
        })

        res.status(OK).json(products)
    } catch (error) {
        errorHandler(res, error)
    }
}

// Post
export const create = async ({ body, method, user }, res, next) => {
    try {
        const shop = await Shop.create(body)

        res.status(CREATED).json(shop.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Put
export const update = async ({ body, user, method, params: { id } }, res, next) => {
    try {
        const shop = await Shop.findById(id).populate('author')

        if (!shop) {
            res.status(NOT_FOUND).end()
            return
        }

        if (!Shop.isOwner(shop, user)) {
            res.status(FORBIDDEN).end()
            return
        }

        await shop.set(body).save()

        res.status(OK).json(shop.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Delete
export const destroy = async ({ params: { id }, user }, res, next) => {
    try {
        const shop = await Shop.findById(id)

        if (!shop) {
            res.status(NOT_FOUND).end()
            return
        }

        if (!Shop.isOwner(shop, user)) {
            res.status(FORBIDDEN).end()
            return
        }

        await shop.deleteOne({ _id: id})

        res.status(NO_CONTENT).end()
    } catch (error) {
        errorHandler(res, error)
    }
}
