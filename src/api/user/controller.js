import { User } from '.'
import { NOT_FOUND, OK, CREATED, FORBIDDEN, NO_CONTENT, CONFLICT } from 'http-status-codes'
import { Verification } from 'a/verification'
import { errorHandler } from 's/response'
import { sendVerification } from 's/mail'
import { Referral } from 'a/referral'
import { Shop } from 'a/shop'

export const index = async ({ querymen, user, method }, res, next) => {
    try {
        const users = await User.paginate(querymen, { method, user, filter: true })
        res.status(OK).json(users)
    } catch (error) {
        errorHandler(res, error)
    }
}

export const show = async ({ user: { _id, role }, method, params: { id } }, res) => {
    try {
        const user = await User.findById(id === 'me' ? _id : id)

        if (!user) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        res.status(OK).json(user.filter({ role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

export const setActiveShop = async ({ user: { _id, role }, body: { shop }, params: { id } }, res) => {
    try {

        if (_id !== id && role !== 'admin') {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission')})
            return
        }

        const user = await User.findById(id === 'me' ? _id : id)
        const { shops = [] } = user
        if (!user || !shops.includes(shop) && role !== 'admin ') {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        user.set('activeShop', shop)
        await user.save()

        res.status(OK).end()
    } catch (error) {
        errorHandler(res, error)
    }
}

export const getActiveShop = async ({ user: { _id, role }, method, params: { id } }, res) => {
    try {
        
        if (_id !== id && role !== 'admin') {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission')})
            return
        }

        const user = await User.findById(id === 'me' ? _id : id).populate('activeShop')
        if (!user || !user.activeShop) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        res.status(OK).json(user.activeShop.filter({ role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

export const getShops = async ({ user: { _id, role }, method, params: { id } }, res) => {
    try {
        
        if (_id !== id && role !== 'admin') {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission')})
            return
        }

        const user = await User.findById(id === 'me' ? _id : id)
        if (!user) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        res.status(OK).json({ shops: user.shops })
    } catch (error) {
        errorHandler(res, error)
    }
}

export const create = async ({ body, method, user }, res, next) => {
    try {

        if (await User.findOne({ email: body.email }) !== null) {
            res.status(CONFLICT).json({ valid: false, message: res.__('email-conflict') })
            return
        }

        const doc = await User.create(body)

        const { token } = await Verification.create({ user: doc._id })

        await sendVerification(body.email, body.name, token)

        res.status(CREATED).json(doc.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

export const update = async ({ body, params, user, method }, res, next) => {
    try {
        const doc = await User.findById(params.id)

        if (!doc) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        if (!User.isOwner(doc, user)) {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission')})
            return
        }

        await doc.set(body).save()

        res.status(OK).json(doc.filter({ role: user.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}

export const updatePassword = async ({ body, params, user }, res, next) => {
    try {
        const doc = await User.findById(params.id)

        if (!doc) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        if (!User.isOwner(doc, user)) {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission')})
            return
        }

        await doc.set(body).save()

        res.status(NO_CONTENT).end()
    } catch (error) {
        errorHandler(res, error)
    }
}

export const destroy = async ({ user, params: { id } }, res, next) => {
    try {
        const doc = await User.findById(id)

        if (!doc) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        if (!User.isOwner(doc, user)) {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission')})
            return
        }

        await User.deleteOne({ _id: id})

        res.status(NO_CONTENT).end()
    } catch (error) {
        errorHandler(res, error)
    }
}
