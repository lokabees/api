import 'dotenv/config'
import request from 'supertest'
import server from '~/server'
import { sign } from 's/auth'
import User from 'a/user/model'
import { Product as Data } from 'a/product'
import { apiRoot, masterKey } from '~/config'
import { parseOpeningHours } from '~/utils/validator'

import { NOT_FOUND, OK, CREATED, FORBIDDEN, NO_CONTENT, UNAUTHORIZED, BAD_REQUEST } from 'http-status-codes'
import { Shop } from 'a/shop'

let adminUser,
    adminToken,
    defaultUser,
    defaultToken,
    userData,
    adminData,
    apiEndpoint = 'products'

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


    const shop = await Shop.create({
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
        images: {
            cover: {
                url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                id: 'shop/abcd'
            },
            profile: {
                url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                id: 'shop/abcd'
            }
        },
        author: defaultUser,
        published: false
    })

    adminUser.activeShop = shop._id
    adminUser.shops = [shop._id]
    await adminUser.save()
    defaultUser.activeShop = shop._id
    defaultUser.shops = [shop._id]
    await defaultUser.save()
    userData = await Data.create({ description: 'nice product', title: 'product', category: 'category', author: defaultUser._id, shop: shop._id })
    adminData = await Data.create({ description: 'nice product', title: 'product', category: 'category', author: adminUser._id, shop: shop._id })

    // Sign in user
    adminToken = (await sign(adminUser)).token
    defaultToken = (await sign(defaultUser)).token

    const datas = Array(100)

    for (let index = 0; index < datas.length; index += 1) {
        datas[index] = new Data({ description: `nice product${index}`, title: 'product', category: 'category', author: defaultUser._id, shop: shop._id })
    }

    await Data.insertMany(datas)
 
})

describe(`TEST ${apiRoot}/${apiEndpoint} ACL`,  () => {

    // INDEX
    test(`GET ${apiRoot}/${apiEndpoint} ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)

        expect(status).toBe(OK)

    })

    test(`GET ${apiRoot}/${apiEndpoint} ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint} ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)
    })

    // SHOW
    test(`GET ${apiRoot}/${apiEndpoint}/:id GUEST OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${userData._id}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${userData._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${userData._id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)

        const authorKeys = Object.keys(body.author)

        const keys = Object.keys(body)
    })

    // CREATE
    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST CREATED`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .send({ description: 'nice product', title: 'product', category: 'category' })

        expect(status).toBe(FORBIDDEN)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER CREATED`, async () => {
        const { status, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .send({ description: 'nice product', title: 'product', category: 'category', picture: { url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg', id: 'shop/abcd' } })
            .set('Authorization', `Bearer ${defaultToken}`) 
        expect(status).toBe(CREATED)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ ADMIN CREATED`, async () => {
        const { status, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ description: 'nice product', title: 'product', category: 'category', picture: { url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg', id: 'shop/abcd' } })
            expect(status).toBe(CREATED)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${userData._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ description: 'nice product', title: 'product', category: 'category' })

        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN (OWNERSHIP)`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${adminData._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ description: 'git gud' })
    
        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${userData._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'censored' })
        expect(body.title).toBe('censored')
        expect(status).toBe(OK)
    })
    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ description: 'reee' })

        expect(status).toBe(NOT_FOUND)
    })

    // DELETE
    test(`DELETE ${apiRoot}/${apiEndpoint}/:id GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${userData._id}`)
        expect(status).toBe(FORBIDDEN)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${userData._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(NO_CONTENT)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN (OWNERSHIP)`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${adminData._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id ADMIN NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${userData._id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(NO_CONTENT)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(NOT_FOUND)
    })

})