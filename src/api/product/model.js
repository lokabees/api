import m2s from 'mongoose-to-swagger'
import mongoose, { Schema } from 'mongoose'
import { paginate, filter, ownership } from 's/mongoose'
import rules from './acl'
import userAcl from 'a/user/acl'

// Data schema for product

const productSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minlength: 2
        },
        description: {
            type: String, 
            required: true, 
        },
        category: {
            type: String,
            required: true
        },
        picture: {
            url: { type: String },
            id: { type: String }
        },
        author: {
            type: 'ObjectId',
            ref: 'User',
            required: false
        },
        shop: {
            type: 'ObjectId',
            ref: 'Shop',
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (obj, ret) => {
                delete ret._id
            }
        }
    }
)


productSchema.plugin(filter, { rules })
productSchema.plugin(paginate, { rules })
productSchema.plugin(ownership)

const model = mongoose.model('Product', productSchema)
model.swaggerSchema = m2s(model)
export const schema = model.schema

export default model
