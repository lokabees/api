import { Shop } from '.'
import { OK, NOT_FOUND, CREATED, FORBIDDEN, NO_CONTENT } from 'http-status-codes'
import { errorHandler } from 's/response'
import { isObjectId } from '~/utils/validator'
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
