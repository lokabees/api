import { merge } from 'lodash'
import { Product as Product } from '.'
import { OK, NOT_FOUND, CREATED, FORBIDDEN, NO_CONTENT } from 'http-status-codes'
import { errorHandler } from 's/response'

// Get all
export const index = async ({ querymen, user, method }, res, next) => {
    try {
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

// Get One
export const show = async ({ params: { id }, method, user }, res, next) => {
    try {
        const product = await Product.findById(id).populate('author')

        if (!product) {
            res.status(NOT_FOUND).end()
            return
        }

        res.status(OK).json(product.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Post
export const create = async ({ body, method, user }, res, next) => {
    try {
        const product = await Product.create(body)

        res.status(CREATED).json(product.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Put
export const update = async ({ body, user, method, params: { id } }, res, next) => {
    try {
        const product = await Product.findById(id).populate('author')

        if (!product) {
            res.status(NOT_FOUND).end()
            return
        }

        if (!Product.isOwner(product, user)) {
            res.status(FORBIDDEN).end()
            return
        }

        await product.set(body).save()

        res.status(OK).json(product.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Delete
export const destroy = async ({ params: { id }, user }, res, next) => {
    try {
        const product = await Product.findById(id)

        if (!product) {
            res.status(NOT_FOUND).end()
            return
        }

        if (!Product.isOwner(product, user)) {
            res.status(FORBIDDEN).end()
            return
        }

        await product.deleteOne({ _id: id})

        res.status(NO_CONTENT).end()
    } catch (error) {
        errorHandler(res, error)
    }
}
