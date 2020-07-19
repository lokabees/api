import m2s from 'mongoose-to-swagger'
import mongoose, { Schema } from 'mongoose'
import { paginate, filter, ownership } from 's/mongoose'
import rules from './acl'
import userAcl from 'a/user/acl'

// Data schema for shop

const dataSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        // TODO: how tf do we model contact?
        contact: { },
        description: {
            type: String,
            required: true // validation?
        },
        address: {
            label: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true },
            county: { type: String, required: true },
            district: { type: String, required: true },
            houseNumber: { type: String, required: true },
            locationId: {
                type: String,
                required: true,
                description: 'locationId is the only field which is actually required from the frontend, all other fields are functionally dependent and can (and should) come directly from the HERE api'
            },
            state: { type: String, required: true },
            street: { type: String, required: true },
            postalCode: { type: Number, required: true },
        },
        // TODO: Remove content and the corresponding tests / controller / whateve
        content: {
            type: String,
            required: true,
            minlength: 2,
        },
        author: {
            type: 'ObjectId',
            ref: 'User',
            required: false,
            description: 'author is the user who created the shop, not necessarily the shop owner'
        },
        published: {
            type: Boolean,
            default: false,
            description: 'unpublished shops will not be accessible for the public (only owner+author+admin)'
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


dataSchema.plugin(filter, { rules })
dataSchema.plugin(paginate, { rules, populateRules: { author: userAcl } })
dataSchema.plugin(ownership)

const model = mongoose.model('Shop', dataSchema)
model.swaggerSchema = m2s(model)
export const schema = model.schema

export default model
