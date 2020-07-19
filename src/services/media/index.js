import cloudinary from 'cloudinary'
import { cloudinaryConfig } from '~/config'

// Cloudinary configuration
cloudinary.config(cloudinaryConfig)

// Yeah... I know its ugly but it works
export const getAsset = async (publicId) => {
    try {
        return await cloudinary.v2.api.resource(publicId)
    } catch (error) {
        return undefined
    }
}
export const mediaSettings = (folder) => ({
    tags: ['bucket', 'temporary'],
    folder,
    use_filename: false,
    crop: 'imagga_scale',
    secure: true,
    width: 1000,
    sign_url: true,
})

export default cloudinary