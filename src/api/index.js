import { Router } from 'express'
/* ENDPOINT_ROUTER_IMPORT */
import newsletter from './newsletter'
import product, { Product } from './product'
import map from './map'
import shop, { Shop } from './shop'
import media from './media'
import auth from './auth'
import verification from './verification'
import passwordReset from './password-reset'
import user, { User } from './user'
import referral, { Referral } from './referral'
const router = new Router()

/* ENDPOINT_ROUTER_EXPORT */
router.use('/newsletters', newsletter)
router.use('/products', product)
router.use('/maps', map)
router.use('/shops', shop)
router.use('/media', media)
router.use('/auth', auth)
router.use('/verification', verification)
router.use('/users', user)
router.use('/password-reset', passwordReset)
router.use('/referrals', referral)

// Export the relevant models for swagger documentation
export const Models = [
    /* ENDPOINT_DOCS_EXPORT */
    Product,
    Shop,
    User,
    Referral
]

// Export router for Express Server
export default router
