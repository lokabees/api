import m2s from 'mongoose-to-swagger'
import mongoose, { Schema } from 'mongoose'
import { paginate, filter, ownership } from 's/mongoose'
import rules from './acl'
import userAcl from 'a/user/acl'

// Data schema for shop

const shopSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 2
        },
        author: {
            type: 'ObjectId',
            ref: 'User',
            required: true
        },
        users: {}
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


shopSchema.plugin(filter, { rules })
shopSchema.plugin(paginate, { rules, populateRules: { author: userAcl } })
shopSchema.plugin(ownership)
shopSchema.methods.canBeModified = async function canBeModified({ _id }) {
    console.log(_id)
    console.log(this)
}


const model = mongoose.model('Shop', shopSchema)
model.swaggerSchema = m2s(model)
export const schema = model.schema

export default model
