import { validate } from 'uuid'
import { Referral } from 'a/referral'
import { Shop } from 'a/shop'

export default async ({ body, user }, res, next) => {
    const { referral } = body

    if (!referral) {
        return next()
    }

    if (!validate(referral)) {
        res.status(400).end()
        return
    }

    const ref = await Referral.findOne({ uuid: referral })
    
    if (!ref) {
        res.status(400).end()
        return
    }

    body.activeShop = ref.shop
    body.shops = [ref.shop]
    return next()
}