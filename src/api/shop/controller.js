import { merge } from 'lodash'
import { Shop } from '.'
import { OK, NOT_FOUND, CREATED, FORBIDDEN, NO_CONTENT } from 'http-status-codes'
import { errorHandler } from 's/response'

const owner_shop_rules = {
    management: {
        shop: {
            create: true, // create is irrelevant
            delete: true, // can delete shop
            update: true  // can modify shop meta data (opening hours, description ...)
        },
        users: {
            create: true, // can invite employees
            delete: true, // can remove employees
            update: true  // can modify employee permissions
        }
    },
    articles: {
        create: true, // can create articles
        delete: true, // can delete articles
        update: true  // can modify articles
    }
}

const employee_shop_rules = {
    management: {
        shop: {
            create: false, // create is irrelevant
            delete: false, // can not delete shop
            update: true  // can modify shop meta data (opening hours, description ...)
        },
        users: {
            create: false, // can not invite employees
            delete: false, // can not remove employees
            update: false  // can not modify employee permissions
        }
    },
    articles: {
        create: true, // can create articles
        delete: true, // can delete articles
        update: true  // can modify articles
    }
}


// Get all
export const index = async ({ querymen, user, method }, res, next) => {
    try {
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
        const shop = await Shop.findById(id).populate('author')

        if (!shop) {
            res.status(NOT_FOUND).end()
            return
        }

        res.status(OK).json(shop.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Post
export const create = async ({ bodymen: { body }, method, user }, res, next) => {
    try {
        const users = {}
        users[user._id] = owner_shop_rules
        const shop = await Shop.create({...body, users})
        if (!shop.canBeModified(user)) {

        }


        res.status(CREATED).json(shop.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

// Put
export const update = async ({ bodymen: { body }, user, method, params: { id } }, res, next) => {
    try {
        const shop = await Shop.findById(id).populate('author')

        if (!shop) {
            res.status(NOT_FOUND).end()
            return
        }
        await shop.canBeModified(user)

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

        await Shop.deleteOne({ _id: id})

        res.status(NO_CONTENT).end()
    } catch (error) {
        errorHandler(res, error)
    }
}
