import { Router } from 'express'
/* ENDPOINT_ROUTER_IMPORT */
import shop, { Shop } from './shop'
import media from './media'
import auth from './auth'
import verification from './verification'
import passwordReset from './password-reset'
import user, { User } from './user'

const router = new Router()

/* ENDPOINT_ROUTER_EXPORT */
router.use('/shops', shop)
router.use('/media', media)
router.use('/auth', auth)
router.use('/verification', verification)
router.use('/users', user)
router.use('/password-reset', passwordReset)

// Export the relevant models for swagger documentation
export const Models = [
    /* ENDPOINT_DOCS_EXPORT */
Shop,
    User
]

// Export router for Express Server
export default router
