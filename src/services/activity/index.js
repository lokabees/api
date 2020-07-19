import { Session } from 'a/session'

export const updateActivity = async ({ user }, res, next) => {

    if (!user) {
        return next()
    }
    const { jti } = user

    await Session.updateOne({ jti }, { lastActivity: Date.now() })

    return next()
}