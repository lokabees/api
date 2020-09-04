import 'dotenv/config'
import request from 'supertest'
import server from '~/server'
import { sign } from 's/auth'
import { User } from 'a/user'
import { apiRoot } from '~/config'
import handler, { mediaSettings } from '~/services/media'
import { writeFileSync, unlinkSync } from 'fs'

import { CREATED, FORBIDDEN, NO_CONTENT, REQUEST_TOO_LONG, BAD_REQUEST, NOT_FOUND } from 'http-status-codes'

let adminUser,
    adminToken,
    defaultUser,
    defaultToken,
    images = [],
    publicImageId,
    apiEndpoint = 'media',
    hugeFilePath = `${__dirname}/../resources/huge_image.jpeg`,
    filePath = `${__dirname}/../resources/image.jpeg`

beforeAll(() => {
    writeFileSync(hugeFilePath, 'x'.repeat(10*1024*1024)+'x') // extra byte is important:D
})

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

    // Sign in user
    adminToken = (await sign(adminUser)).token
    defaultToken = (await sign(defaultUser)).token

    // create image which we can delete
    const settings = mediaSettings('user')
    settings.tags = [defaultUser._id, 'test']
    delete settings.crop
    const { public_id } = await handler.v2.uploader.upload(filePath, settings)
    publicImageId = public_id
})


afterAll(() => {
    images.forEach(async (id) => {
        await handler.v2.uploader.destroy(id)
    })
    unlinkSync(hugeFilePath)
})

describe(`TEST ${apiRoot}/${apiEndpoint} ACL`,  () => {

    // CREATE
    test(`POST ${apiRoot}/${apiEndpoint}/user GUEST FORBIDDEN`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/user`)
            .attach('file', filePath)

        expect(status).toBe(FORBIDDEN)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/user USER CREATED`, async () => {
        const { status, body: { id } } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/user`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .attach('file', filePath)

        images.push(id)
        expect(status).toBe(CREATED)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/shop USER CREATED`, async () => {
        const { status, body: { id } } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/shop`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .attach('file', filePath)

        images.push(id)
        expect(status).toBe(CREATED)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/user ADMIN CREATED`, async () => {
        const { status, body: { id } } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/user`)
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('file', filePath)

        images.push(id)
        expect(status).toBe(CREATED)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/user/:folder/:id USER NO_CONTENT`, async () => {
        const { status, body: { id } } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/${publicImageId}`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(NO_CONTENT)
    })

    test(`DELETE ${apiRoot}/${apiEndpoint}/user/:folder/:id USER NO_CONTENT`, async () => {
        const { status, body: { id } } = await request(server)
            .delete(`${apiRoot}/${apiEndpoint}/user/123`)
            .set('Authorization', `Bearer ${defaultToken}`)

        expect(status).toBe(NOT_FOUND)
    })

})

describe(`TEST ${apiRoot}/${apiEndpoint} VALIDATION`,  () => {

    // TODO: Test max file size, abort, timeout and other shit
    test(`POST ${apiRoot}/${apiEndpoint}/ USER FORBIDDEN (bad folder)`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/unicorns`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .attach('file', filePath)

        expect(status).toBe(FORBIDDEN)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER REQUEST_TOO_LONG (file to big)`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/user`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .attach('file', hugeFilePath)
        expect(status).toBe(REQUEST_TOO_LONG)
    })

    test(`POST ${apiRoot}/${apiEndpoint}/ USER BAD_REQUEST (wrong filename)`, async () => {
        const { status } = await request(server)
            .post(`${apiRoot}/${apiEndpoint}/user`)
            .set('Authorization', `Bearer ${defaultToken}`)
            .attach('yeet', filePath)
        expect(status).toBe(BAD_REQUEST)
    })

})