import 'dotenv/config'
import request from 'supertest'
import server from '~/server'
import { sign } from 's/auth'
import { User } from 'a/user'
import { Product } from 'a/product'
import { Shop, ShopCategory } from 'a/shop'
import { apiRoot } from '~/config'
import { NOT_FOUND, OK, CREATED, FORBIDDEN, NO_CONTENT, BAD_REQUEST } from 'http-status-codes'
import { parseOpeningHours } from '~/utils/validator'
import { encode } from 'ngeohash'

let adminUser,
    adminToken,
    shop,
    category,
    defaultUser,
    defaultToken,
    adminShop,
    adminProduct,
    defaultProduct,
    apiEndpoint = 'shops'

beforeEach(async () => {

    defaultUser = await User.create({
        name: 'Marty',
        email: 'marty0@lokabees.de',
        password: 'SuperPasswort123?!',
        role: 'user'
    })

    adminUser = await User.create({
        name: 'Marty',
        email: 'marty1@lokabees.de',
        password: 'SuperPasswort123?!',
        role: 'admin'
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
            monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
            tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
            wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
            thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
            friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
            saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
            sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
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
    
    adminShop = await Shop.create({
        name: 'Admin Kekseladen',
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
        author: adminUser,
        published: true
    })
    defaultProduct = await Product.create({ description: 'nice product', title: 'product', category: 'category', author: defaultUser._id, shop: shop._id })
    adminProduct = await Product.create({ description: 'nice product', title: 'product', category: 'category', author: adminUser._id, shop: adminShop._id })

    category = await ShopCategory.create({ name: 'category1' })

    defaultToken = (await sign(defaultUser)).token
    adminToken = (await sign(adminUser)).token
})

describe(`TEST ${apiRoot}/${apiEndpoint} ACL`,  () => {
    
    // INDEX
    test(`GET ${apiRoot}/${apiEndpoint} GUEST OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)

        expect(body.rows).toHaveLength(1)
        expect(status).toBe(OK)
    })
 
    test(`GET ${apiRoot}/${apiEndpoint} USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(body.rows).toHaveLength(1)
        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint} ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(body.rows).toHaveLength(2)
        expect(status).toBe(OK)
    })

    // SHOW
    test(`GET ${apiRoot}/${apiEndpoint}/:id GUEST NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${shop._id}`)

        expect(status).toBe(NOT_FOUND)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id USER SLUG OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${shop.slug}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/:id ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(status).toBe(OK)

    })

    test(`GET ${apiRoot}/${apiEndpoint}/near/:geohash GUEST OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/near/${encode(49.019587, 8.422082)}`)
            
        expect(status).toBe(OK)
        expect(body.count).toBe(1)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/near/:geohash USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/near/${encode(49.019587, 8.422082)}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(OK)
        expect(body.count).toBe(1)
    })

    test(`GET ${apiRoot}/${apiEndpoint}/near/:geohash ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/near/${encode(49.019587, 8.422082)}`)
            .set('Authorization', `Bearer ${adminToken}`)

        // console.log(body.rows)
        expect(status).toBe(OK)
        expect(body.count).toBe(2) // 2 because unpublished shops are getting shown
    })

    // Products
    test(`GET ${apiRoot}/${apiEndpoint} GUEST OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${adminShop._id}/products`)

        expect(body.rows).toHaveLength(1)
        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint} USER OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${adminShop._id}/products`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(body.rows).toHaveLength(1)
        expect(status).toBe(OK)
    })

    test(`GET ${apiRoot}/${apiEndpoint} ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .get(`${apiRoot}/${apiEndpoint}/${adminShop._id}/products`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(body.rows).toHaveLength(1)
        expect(status).toBe(OK)
    })
    
    // CREATE
    test(`POST ${apiRoot}/${apiEndpoint}/ ADMIN CREATED`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
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
                slug: 'hehehe u got hacked',
                author: defaultUser,
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                },
                published: true
            })

        // slug got generated
        expect(body.slug).not.toBeUndefined()

        // shop got added to user
        const user = await User.findById(adminUser._id)
        expect(user.activeShop.toString()).toBe(body._id)
        expect(user.shops.findIndex(e => e.toString() === body._id)).not.toBe(-1)

        expect(status).toBe(CREATED)

    })

    test(`POST ${apiRoot}/${apiEndpoint}/ GUEST FORBIDDEN`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .send({
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
                author: defaultUser,
                published: true
            })

        expect(status).toBe(FORBIDDEN)

    })
    
    test(`POST ${apiRoot}/${apiEndpoint}/ USER CREATED`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                },
                categories: [category._id],
                author: defaultUser,
                published: true,
                delivery: ['MD', 'LD']
            })

        expect(status).toBe(CREATED)
        // slug got generated
        expect(body.slug).not.toBeUndefined()
        // openinghours virtual works
        expect(body.openingHours.monday.open).toBe('08:00')
        expect(body.openingHours.monday.close).toBe('18:00')
        expect(body.openingHours.monday.breaks[0].from).toBe('12:00')
        expect(body.openingHours.monday.breaks[0].to).toBe('13:00')
        expect(body.openingHours).not.toBeUndefined()
        expect(body.isOpen).not.toBeUndefined()
    })
    
    // UPDATE
    test(`PUT ${apiRoot}/${apiEndpoint}/:id GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .send({ name: 'updated name?' })
        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ name: 'new_name' })

        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN ownership`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${adminShop._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({ name: 'git gud' })

        expect(status).toBe(FORBIDDEN)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN OK`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'mhmhmh' })

        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN OK CHANGE ONE IMAGE`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                images: {
                    cover: {
                        url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/aaaaaaa.jpg',
                        id: 'shop/aaaaaaa'
                    }
                }
            })
        expect(body.images.profile).not.toBeUndefined()
        expect(body.images.cover.id).toBe('shop/aaaaaaa')
        expect(body.images.cover.url).toBe('https://res.cloudinary.com/test/image/upload/v1589192972/shop/aaaaaaa.jpg')
        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN OK DELETE IMAGE`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ // deletes cover
                images: {
                    cover: {
                        url: null,
                        id: null
                    }
                }
            })
        expect(body.images.cover.url).toBeNull()
        expect(body.images.cover.id).toBeNull()
        expect(status).toBe(OK)
    })

    test(`PUT ${apiRoot}/${apiEndpoint}/:id ADMIN NOT_FOUND`, async () => {
        const { status, body } = await request(server)
            .put(`${apiRoot}/${apiEndpoint}/5ee5309727c6997fa0339135`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'reee' })

        expect(status).toBe(NOT_FOUND)
    })
 
    // DELETE
    test(`DELETE ${apiRoot}/${apiEndpoint}/:id GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${shop._id}`)
        expect(status).toBe(FORBIDDEN)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${shop._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(NO_CONTENT)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN ownership`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${adminShop._id}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(FORBIDDEN)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id ADMIN NO_CONTENT`, async () => {
        const { status, body } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${shop._id}`)
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

  describe(`TEST ${apiRoot}/${apiEndpoint} VALIDATION`,  () => {

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST WRONG CATEGORY`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                },
                categories: ['123', null, 7]
            })
    
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD REQUEST missing name`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
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
                author: defaultUser,
                published: true
            })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD REQUEST missing description`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                contact: {
                    website: 'https://www.kekse.de',
                    facebook: 'https://facebook.com/claudias_kekseladen',
                    instagram: 'https://instagram.com/claudias_kekseladen',
                    phone: '+49 1234 12345',
                    email: 'claudia@kekse.de',   
                },
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
                author: defaultUser,
                published: true
            })

        expect(status).toBe(BAD_REQUEST)
    })
 
    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD REQUEST missing address`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
                contact: {
                    website: 'https://www.kekse.de',
                    facebook: 'https://facebook.com/claudias_kekseladen',
                    instagram: 'https://instagram.com/claudias_kekseladen',
                    phone: '+49 1234 12345',
                    email: 'claudia@kekse.de',   
                },
                author: defaultUser,
                published: true
            })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER CREATED minimum`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { breaks: [] },
                    tuesday: { breaks: [] },
                    wednesday: { breaks: [] },
                    thursday: { breaks: [] },
                    friday: { breaks: [] },
                    saturday: { breaks: [] },
                    sunday: { breaks: [] },
                }
            })
        expect(body.openingHours.monday.open).toBeUndefined()
        expect(body.openingHours.monday.close).toBeUndefined()
        expect(body.openingHours.monday.breaks).toHaveLength(0)
        expect(status).toBe(CREATED)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER CREATED empty openinghours`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                }
            })

        expect(status).toBe(CREATED)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST delivery`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                },
                delivery: ['LOL']
            })
        
        expect(status).toBe(BAD_REQUEST)
    })


    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST delivery 1`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                },
                delivery: 'LOL'
            })
        
        expect(status).toBe(BAD_REQUEST)
    })



    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST ore segments`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }, { from: '14:00', to: '15:00' }, { from: '16:00', to: '17:00' }] },
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST closing before opening`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '7:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST 3 breaks`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }, { from: '14:00', to: '15:00' }, { from: '16:00', to: '17:00' }] },
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid values`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: '18:00', breaks: [{ from: 8, to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid values`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                openingHours: {
                    monday: { open: '8:00', close: 'lol', breaks: [{ from: '12:00', to: '13:00' }] },
                    tuesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    wednesday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    thursday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    friday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    saturday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                    sunday: { open: '8:00', close: '18:00', breaks: [{ from: '12:00', to: '13:00' }] },
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid cover image`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                images: {
                    cover: {
                        url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                        id: 'shop/123'
                    }
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid cover image`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                images: {
                    cover: {
                        url: 'what',
                        id: 'shop/123'
                    }
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid profile image`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                images: {
                    profile: {
                        url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                        id: 'shop/123'
                    }
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid profile image`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
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
                images: {
                    profile: {
                        url: 'what',
                        id: 'shop/123'
                    }
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid instagram`, async () => {
        const { status, body, error } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                contact: {
                    instagram: 'google.de'
                },
                description: 'hi',
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
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid facebook`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                contact: {
                    facebook: 'google.de'
                },
                description: 'hi',
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

            })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid website`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                contact: {
                    website: 'huh'
                },
                description: 'hi',
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
            })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid phone`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                contact: {
                    phone: '3.14'
                },
                description: 'hi',
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
            })

        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid email`, async () => {
        const { status, body } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                contact: {
                    email: 'hmmhh'
                },
                description: 'hi',
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
            })

        expect(status).toBe(BAD_REQUEST)
    })
})
