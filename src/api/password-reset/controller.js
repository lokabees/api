import { PasswordReset } from '.'
import { OK, NO_CONTENT, FORBIDDEN, BAD_REQUEST } from 'http-status-codes'
import { User } from 'a/user'
import { Session } from 'a/session'
import { errorHandler } from 's/response'
import { sendPasswordReset } from 's/mail'

export const show = async ({ params: { token } }, res, next) => {
    try {
        const reset = await PasswordReset.findOne({ token }).populate('user')

        if (!reset || !reset.user) {
            res.status(BAD_REQUEST).json({ valid: false, message: res.__('missing-or-wrong-parameters') }).end()
            return
        }
        const { picture, name } = reset.user

        res.status(OK).json({ picture, name })

    } catch (error) {
        errorHandler(res, error)
    }
}

export const create = async ({ body: { email } }, res, next) => {
    try {
        const user = await User.findOne({ email })

        if (!user) {
            // We don't want to allow user enumeration, thats why we return NO_CONTENT instead of NOT_FOUND.
            // This endpoint should be monitored
            res.status(NO_CONTENT).end()
            return
        }

        const reset = await PasswordReset.create({ user: user._id })
        const { token } = reset
        const os = 'Linux'
        const browser = 'Firefox'
        await sendPasswordReset(email, user.name, token, os, browser)

        res.status(NO_CONTENT).end()

    } catch (error) {
        errorHandler(res, error)
    }

}

export const update = async ({ body: { password }, params: { token } }, res, next) => {

    try {
        const { user } = await PasswordReset.findOne({ token }).populate('user') ?? {}

        if (!user || !user.verified) {
            // Is 403 the right code? We should also monitor this endpoint closely
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission') }).end()
            return
        }

        await user.set({ password }).save()
        await PasswordReset.deleteOne({ user })
        await Session.deleteAllUserSessions(user._id)

        res.status(NO_CONTENT).end()

    } catch (error) {
        errorHandler(res, error)
    }

}