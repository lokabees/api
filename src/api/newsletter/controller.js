import { OK } from 'http-status-codes'
import { errorHandler } from 's/response'
import { unsubscribeUser } from 's/mail'

// Get all
export const webhook = async ({ body }, res, next) => {
    try {
        const { type, data: { id }} = body
        if (type === 'unsubscribe') {
            unsubscribeUser(id)
        }
        res.status(OK).end()
    } catch (error) {
        errorHandler(res, error)
    }
}

