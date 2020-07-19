import { NOT_FOUND, CREATED, FORBIDDEN, NO_CONTENT, BAD_REQUEST } from 'http-status-codes'
import { errorHandler } from 's/response'
import handler, { mediaSettings, getAsset } from '~/services/media'

// Post
export const create = async ({ params: { folder }, user, files }, res, next) => {
    try {

        if (!files || !files.file) {
            res.status(BAD_REQUEST).json({ valid: false, message: res.__('missing-files') })
            return
        }

        const { file } = files
        // TODO: Make sure its an image

        // TODO: clean up
        if (folder !== 'user') {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission') })
            return
        }

        const settings = mediaSettings(folder)
        settings.tags = [user._id]

        // Remove crop settings in dev and save money
        if (process.env.NODE_ENV !== 'production') {
            delete settings.crop
        }

        const {
            public_id,
            etag,
            format,
            secure_url,
        } = await handler.v2.uploader.upload(file.tempFilePath, settings)
        res.status(CREATED).json({ id: public_id, etag, format, url: secure_url })

    } catch (error) {
        errorHandler(res, error)
    }
}

// Delete
export const destroy = async ({ params: { folder, id }, user: { _id, role } }, res, next) => {
    try {

        const publicId = `${folder}/${id}`

        const meta = await getAsset(publicId)
        if (!meta) {
            res.status(NOT_FOUND).json({ valid: false, message: res.__('not-found') })
            return
        }

        const { tags } = meta
        if (role !== 'admin' && !tags.includes(_id)) {
            res.status(FORBIDDEN).json({ valid: false, message: res.__('missing-permission') })
            return
        }

        await handler.v2.uploader.destroy(id)
        res.status(NO_CONTENT).end()

    } catch (error) {
        errorHandler(res, error)
    }
}
