import { maxSessionCount, apiRoot, masterKey } from '~/config'
import { sign } from 's/auth'
import { Session } from 'a/session'
import { User } from 'a/user'
import request from 'supertest'
import server from '~/server'
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes'

let adminUser,
    defaultUser

beforeEach(async () => {

    adminUser = await User.create({
        name: 'Marty',
        email: 'marty@getit.social',
        password: 'Passwort213!!!',
        role: 'admin',
        verified: true
    })

    defaultUser = await User.create({
        name: 'Marty',
        email: 'marty1@getit.social',
        password: 'Passwort213!!!',
        role: 'admin',
        verified: true
    })

})

describe('Test maxSessionCount', () => {

    test(`A user never has more than ${maxSessionCount} session`, async () => {
        for (let index = 0; index < maxSessionCount + 1; index += 1) {
            await sign(adminUser)
        }

        expect(await Session.countDocuments({ user: adminUser._id })).toBe(maxSessionCount)
    })

    test('The oldest session gets deleted when going over the limit', async () => {

        const { jti } = await sign(adminUser)

        for (let index = 0; index < maxSessionCount; index += 1) {
            await sign(adminUser)
        }

        expect(await Session.exists({ jti })).toBe(false)
        expect(await Session.countDocuments({ user: adminUser._id })).toBe(maxSessionCount)

    })

    test('Only the correct sessions get deleted', async () => {

        const { jti } = await sign(defaultUser)

        for (let index = 0; index < maxSessionCount + 1; index += 1) {
            await sign(adminUser)
        }

        expect(await Session.exists({ jti })).toBe(true)
        expect(await Session.countDocuments({ user: adminUser._id })).toBe(maxSessionCount)
    })


    test('lastActivity gets updated after request', async () => {

        const { token, jti } = await sign(adminUser)
        const { lastActivity } = await Session.findOne({ jti })

        // request a random endpoint with the token
        const { status } = await request(server)
            .get(`${apiRoot}/users/me`)
            .set('Authorization', `Bearer ${token}`)

        expect(status).toBe(OK)

        expect((await Session.findOne({ jti }).lastActivity)).not.toBe(lastActivity)

    })

    test('Middleware does not crash if no session is present', async () => {

        const { status } = await request(server)
            .post(`${apiRoot}/users?master=${masterKey}`)
            .send({ email: 'marty2@getit.social', password: 'SoEinGutesPasswortOmg123?!', name: 'Marty' })

        expect(status).not.toBe(INTERNAL_SERVER_ERROR)

    })

})
