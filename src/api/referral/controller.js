import { Referral } from '.'
import { NOT_FOUND, CREATED } from 'http-status-codes'
import { errorHandler } from 's/response'
import { Shop } from 'a/shop'

export const create = async ({ body: { shop }, method, user }, res, next) => {
    try {
        const shop = await Shop.findById(shop)

        if (!shop) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found')})
            return
        }

        const ref = await Referral.create({ shop: shop._id })

        res.status(CREATED).json(ref.filter({ role: user?.role, method }))
    } catch (error) {
        errorHandler(res, error)
    }
}