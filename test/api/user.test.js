import 'dotenv/config'
import request from 'supertest'
import server from '~/server'
import { sign } from 's/auth'
import User from 'a/user/model'
import { Shop } from 'a/shop'
import { apiRoot, masterKey } from '~/config'
import { NOT_FOUND, OK, CREATED, FORBIDDEN, NO_CONTENT, UNAUTHORIZED, BAD_REQUEST, CONFLICT } from 'http-status-codes'
import { parseOpeningHours } from '~/utils/validator'
import { defaultTo } from 'lodash'

let adminUser,
    adminToken,
    defaultUser,
    defaultToken,
    user1Token,
    shop,
    apiEndpoint = 'users'

beforeEach(async () => {
    adminUser = await User.create({
        name: 'Marty',
        email: 'marty@getit.social',
        password: 'SuperPasswort123?!',
        role: 'admin'
    })

    defaultUser = await User.create({
        name: 'Marty',
        email: 'marty0@getit.social',
        password: 'SuperPasswort123?!',
        role: 'user'
    })
    
    const user1 = await User.create({
        name: 'Marty',
        email: 'marty1@getit.social',
        password: 'SuperPasswort123?!',
        role: 'user'
    })

    shop = await Shop.create({
        name: 'Claudias Kekseladen',
        contact: {
            website: 'https://www.kekse.de',
            facebook: 'https://facebook.com/claudias_kekseladen',
            instagram: 'https://instagram.com/claudias_kekseladen',
            phone: '+49 1234 12345',
            email: 'claudia@kekse.de',   
        },
        description: 'Kekse sind toll.',
        address: {
            name: 'Klosterweg 28, 76131 Karlsruhe, Deutschland',
            geometry: {
              type: 'Point',
              coordinates: [
                8.422082,
                49.019587
              ]
            },
            number: '28',
            street: 'Klosterweg',
            postcode: '76131',
            city: 'Karlsruhe',
            state: 'Baden-Württemberg',
            country: 'Deutschland',
            locality: 'Oststadt Nördlicher Teil'
        },
        parsedOpeningHours: parseOpeningHours({
            monday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            tuesday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            wednesday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            thursday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            friday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            saturday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            sunday: []
        }),
        author: defaultUser,
        published: false
    })

    const shop1 = await Shop.create({
        name: 'Claudias Kekseladen',
        contact: {
            website: 'https://www.kekse.de',
            facebook: 'https://facebook.com/claudias_kekseladen',
            instagram: 'https://instagram.com/claudias_kekseladen',
            phone: '+49 1234 12345',
            email: 'claudia@kekse.de',   
        },
        description: 'Kekse sind toll.',
        address: {
            name: 'Klosterweg 28, 76131 Karlsruhe, Deutschland',
            geometry: {
              type: 'Point',
              coordinates: [
                8.422082,
                49.019587
              ]
            },
            number: '28',
            street: 'Klosterweg',
            postcode: '76131',
            city: 'Karlsruhe',
            state: 'Baden-Württemberg',
            country: 'Deutschland',
            locality: 'Oststadt Nördlicher Teil'
        },
        parsedOpeningHours: parseOpeningHours({
            monday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            tuesday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            wednesday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            thursday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            friday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            saturday: [{ open: '9:00', close: '12:00' }, { open: '13:00', close: '18:00' }],
            sunday: []
        }),
        author: defaultUser,
        published: false
    })


    defaultUser.shops.push(shop1._id)
    await defaultUser.save()
    // Sign in user
    adminToken = (await sign(adminUser)).token
    defaultToken = (await sign(defaultUser)).token
    user1Token = (await sign(user1)).token

})

describe(`TEST ${apiRoot}/${apiEndpoint} ACL`,  () => {

    // INDEX
    test(`GET ${apiRoot}/${apiEndpoint} USER FORBIDDEN`, async () => {
        const { status } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`GET ${apiRoot}/${apiEndpoint} GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`GET ${apiRoot}/${apiEndpoint} ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)

        // check if view worked, pagination gets tested separately
        const { rows } = body
        const [ first ] = rows
        const keys = Object.keys(first)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name']))
    })

    // SHOWME
    test(`GET ${apiRoot}/${apiEndpoint}/me GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/me`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/me USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/me`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)

        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    test(`GET ${apiRoot}/${apiEndpoint}/me ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/me`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)

        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })


    // SHOW
    test(`GET ${apiRoot}/${apiEndpoint}/:id GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${adminUser._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)

        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id USER NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(NOT_FOUND)

    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${adminUser._id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)

        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    // GET ACTIVE SHOP
    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/active USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/ USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(Array.isArray(body.shops)).toBe(true)
        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/active GUEST FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/ GUEST FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/`)

        expect(status).toBe(FORBIDDEN)
    })

    // GET ACTIVE SHOP
    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/active ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/ ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(Array.isArray(body.shops)).toBe(true)
        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/active WRONG USER FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)
            .set('Authorization', `Bearer ${user1Token}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id/shops/ WRONG USER FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/`)
            .set('Authorization', `Bearer ${user1Token}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/shops/active WRONG USER FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ shop: shop._id })

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/shops/active ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ shop: shop._id })

        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/shops/active USER OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/shops/active`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ shop: shop._id })

        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/shops/active ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${adminUser._id}/shops/active`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ shop: shop._id })

        expect(status).toBe(NOT_FOUND)
    })

    // CREATE
    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST CREATED`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty2@getit.social', password: 'SoEinGutesPasswortOmg123?!', name: 'Marty' })

        expect(status).toBe(CREATED)

        const { verified } = await User.findOne({ email: 'marty2@getit.social' })
        expect(verified).toBe(false)

        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ email: 'marty2@getit.social', password: 'SoEinGutesPasswortOmg123?!', name: 'Marty' })

        expect(status).toBe(FORBIDDEN)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ ADMIN CREATED`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty2@getit.social', password: 'SoEinGutesPasswortOmg123?!', name: 'Marty' })

        expect(status).toBe(CREATED)
        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    // UPDATE
    test(`PUT ${apiRoot}/${apiEndpoint}/:id GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ name: 'Hans' })

        expect(status).toBe(OK)
        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN (OWNERSHIP)`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${adminUser._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ name: 'Hans' })

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Berta' })

        expect(status).toBe(OK)

        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Berta' })

        expect(status).toBe(NOT_FOUND)
    })

    // DELETE
    test(`DELETE ${apiRoot}/${apiEndpoint}/:id GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)
        expect(status).toBe(FORBIDDEN)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(NO_CONTENT)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN (OWNERSHIP)`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${adminUser._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id ADMIN NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${defaultUser._id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(NO_CONTENT)

    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(NOT_FOUND)
    })

    // UPDATE PASSWORD
    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/password`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password USER NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/password`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ password: 'yeeeEeeha123?!?!?!' })

        expect(status).toBe(NO_CONTENT)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password USER FORBIDDEN (OWNERSHIP)`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${adminUser._id}/password`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ password: 'yEEEEEEEEEEEET?123!' })

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password ADMIN NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/password`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ password: 'Bert!!!1123a' })

        expect(status).toBe(NO_CONTENT)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135/password`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ password: 'Berta122313?!?!' })

        expect(status).toBe(NOT_FOUND)
    })

})

describe(`TEST ${apiRoot}/${apiEndpoint} MASTERKEY`,  () => {

    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST CREATED`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty2@getit.de', password: 'SoEinGutesPasswortOmg123?!', name: 'Marty' })

        expect(status).toBe(CREATED)
        const keys = Object.keys(body)
        expect(keys).toEqual(expect.arrayContaining(['_id', 'verified', 'role', 'name', 'email']))
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST UNAUTHORIZED`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .send({ email: 'marty2@getit.social', password: 'SoEinGutesPasswortOmg123?!', name: 'Marty' })

        expect(status).toBe(UNAUTHORIZED)
    })

})

describe(`TEST ${apiRoot}/${apiEndpoint} VALIDATION`,  () => {

    // CREATE
    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST BAD_REQUEST PASSWORD`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty2@getit.social', password: 'passwort', name: 'Marty' })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST BAD_REQUEST MAIL`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'dasistkeinemail', password: 'Passwort123?!!!?', name: 'Marty' })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST CREATED ROLE IMMUTABLE`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty3@getit.social', password: 'Passwort123?!!!?', name: 'Marty', role: 'admin' })

        expect(status).toBe(CREATED)
        
        const { role } = await User.findOne({ email: 'marty3@getit.social' })
        expect(role).toBe('user')

    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password USER BAD_REQUEST`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/password`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ password: 'lmao' })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password USER NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/password`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ password: 'GUTesPasWort164?!?!?!' })

        expect(status).toBe(NO_CONTENT)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST CONFLICT`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty@getit.social', password: 'PAassworrrt?!12', name: 'Marty' })

        expect(status).toBe(CONFLICT)
    })

})

describe(`TEST ${apiRoot}/${apiEndpoint} PASSWORD HASHED`, () => {

    // CREATE
    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST CREATED PASSWORD`, async () => {
        const { status, body: { _id } } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}?master=${masterKey}`)
            .send({ email: 'marty2@getit.social', password: 'Passwort123?!?1', name: 'Marty' })

        expect(status).toBe(CREATED)

        const { password } = User.findById(_id)
        expect(password).not.toBe('Passwort123?!?1')
    })

    // UPDATE
    test(`PUT ${apiRoot}/${apiEndpoint}/:id/password USER NO_CONTENT`, async () => {
        const { status, body: { _id } } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${defaultUser._id}/password`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ password: 'GUTesPasWort164?!?!?!' })

        expect(status).toBe(NO_CONTENT)

        const { password } = User.findById(_id)
        expect(password).not.toBe('GUTesPasWort164?!?!?!')
    })

})

describe('TEST USER GRAVATAR', () => {

    test('Create user without picture', async () => {
        const user = await User.create({
            name: 'fritz',
            email: 'fritz@getit.social',
            password: 'SuperPasswort123?!',
            role: 'admin'
        })
        expect(user.picture).not.toBeUndefined()
    })

    test('Create user with picture', async () => {
        const user = await User.create({
            name: 'fritz',
            email: 'fritz@getit.social',
            password: 'SuperPasswort123?!',
            role: 'admin',
            picture: 'https://www.getit.social'
        })

        expect(user.picture).toBe('https://www.getit.social')
    })

    test('Update user email with picture', async () => {
        const user = await User.create({
            name: 'fritz',
            email: 'fritz@getit.social',
            password: 'SuperPasswort123?!',
            role: 'admin',
            picture: 'https://www.getit.social'
        })

        expect(user.picture).toBe('https://www.getit.social')

        await user.set({ email: 'gerda@getit.social'}).save()

        // picture should not get updated
        expect(user.picture).toBe('https://www.getit.social')

    })

    test('Update user email with gravatar', async () => {
        const user = await User.create({
            name: 'fritz',
            email: 'fritz@getit.social',
            password: 'SuperPasswort123?!',
            role: 'admin',
        })
        const picture = user.picture
        expect(picture).not.toBeUndefined()

        await user.set({ email: 'gerda@getit.social'}).save()

        // picture should get updated
        expect(user.picture).toContain('https://gravatar.com')

    })

})
