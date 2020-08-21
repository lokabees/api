import 'dotenv/config'
import request from 'supertest'
import server from '~/server'
import { sign } from 's/auth'
import User from 'a/user/model'
import { Shop } from 'a/shop'
import { apiRoot } from '~/config'
import { NOT_FOUND, OK, CREATED, FORBIDDEN, NO_CONTENT, UNAUTHORIZED, BAD_REQUEST } from 'http-status-codes'

let adminUser,
    adminToken,
    shop,
    defaultUser,
    defaultToken,
    adminShop,
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
            locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
            locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
        },
        author: adminUser,
        published: true
    })

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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
                slug: 'hehehe u got hacked',
                author: defaultUser,
                published: true
            })

        // make sure here api request worked
        expect(body.address.label).not.toBeUndefined()
        expect(body.address.city).not.toBeUndefined()
        expect(body.address.country).not.toBeUndefined()
        expect(body.address.county).not.toBeUndefined()
        expect(body.address.district).not.toBeUndefined()
        expect(body.address.houseNumber).not.toBeUndefined()
        expect(body.address.locationId).not.toBeUndefined()
        expect(body.address.state).not.toBeUndefined()
        expect(body.address.street).not.toBeUndefined()
        expect(body.address.postalCode).not.toBeUndefined()
        expect(body.address.displayPosition).not.toBeUndefined()

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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
                author: defaultUser,
                published: true
            })

        expect(status).toBe(FORBIDDEN)

    })
    
    test(`POST ${apiRoot}/${apiEndpoint}/ USER CREATED`, async () => {
        const { status, body } = await request(server)
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
                images: {
                    title: {
                        url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                        id: 'shop/abcd'
                    },
                    profile: {
                        url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                        id: 'shop/abcd'
                    }
                },
                author: defaultUser,
                published: true
            })

        expect(status).toBe(CREATED)

        // make sure here api request worked
        expect(body.address.label).not.toBeUndefined()
        expect(body.address.city).not.toBeUndefined()
        expect(body.address.country).not.toBeUndefined()
        expect(body.address.county).not.toBeUndefined()
        expect(body.address.district).not.toBeUndefined()
        expect(body.address.houseNumber).not.toBeUndefined()
        expect(body.address.locationId).not.toBeUndefined()
        expect(body.address.state).not.toBeUndefined()
        expect(body.address.street).not.toBeUndefined()
        expect(body.address.postalCode).not.toBeUndefined()
        expect(body.address.displayPosition).not.toBeUndefined()

        // slug got generated
        expect(body.slug).not.toBeUndefined()

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

    test(`PUT ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN (OWNERSHIP)`, async () => {
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

    test(`DELETE ${apiRoot}/${apiEndpoint}/:id USER FORBIDDEN (OWNERSHIP)`, async () => {
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
                author: defaultUser,
                published: true
            })

        expect(status).toBe(BAD_REQUEST)
    })
 
    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD REQUEST missing locationId`, async () => {
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
            })
        
        expect(status).toBe(CREATED)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid title image`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
                address: {
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
                images: {
                    title: {
                        url: 'https://res.cloudinary.com/test/image/upload/v1589192972/shop/abcd.jpg',
                        id: 'shop/123'
                    }
                }
            })
        
        expect(status).toBe(BAD_REQUEST)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST invalid title image`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .send({
                name: 'Kekse!',
                description: 'hi',
                address: {
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
                images: {
                    title: {
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
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
                    locationId: 'NT_0OLEZjK0pT1GkekbvJmsHC_yYD'
                },
            })

        expect(status).toBe(BAD_REQUEST)
    })
 
})
