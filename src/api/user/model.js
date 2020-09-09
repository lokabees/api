import m2s from 'mongoose-to-swagger'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { gravatar, paginate, filter, ownership } from 's/mongoose'
import { hashPassword } from 's/auth'
import rules from './acl'
import userAcl from 'a/user/acl'
import { passwordValidator, emailValidator } from '~/utils/validator'
import randtoken from 'rand-token'

const roles = ['guest', 'user', 'admin']
const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: (value) => emailValidator.test(value),
                message: props => 'Email is invalid'
            }
        },
        password: {
            type: String,
            required: false,
            select: false,
            validate: {
                validator: (value) => passwordValidator.test(value),
                message: props => 'Password is invalid'
            }
        },
        name: {
            type: String,
            index: true,
            trim: true
        },
        services: {
            facebook: String,
            github: String,
            google: String
        },
        role: {
            type: String,
            enum: roles,
            default: 'user'
        },
        picture: {
            type: String,
            trim: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        activeShop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
        },
        shops: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Shop',
                },
            ],
            validate: [
                shops => shops.length <= 100,
                'only 100 shops per user',
            ],
        },
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next()
    }

    this.password = await hashPassword(this.password)
    return next()
})

userSchema.statics = {
    roles,
    async createFromService({ service, id, email, name, picture }) {
        const user = await this.findOne({
            $or: [{ [`services.${service}`]: id }, { email }],
        })
        if (user) {
            user.services[service] = id
            user.name = name
            user.picture = picture
            user.verified = true
            return user.save()
        } else {
            const password = randtoken.generate(32, 'aA1!&bB2§/cC3$(dD4%)')
            const newUser = this.create({
                services: { [service]: id },
                email,
                password,
                name,
                picture,
                verified: true,
            })

            return newUser
        }
    },
}

userSchema.plugin(ownership, { custom: (doc, user) =>  user.role === 'admin' || doc._id.toString() === user._id })
userSchema.plugin(gravatar)
userSchema.plugin(paginate, { rules, populateRules: { user: userAcl } })
userSchema.plugin(mongooseKeywords, { paths: ['email', 'name'] })
userSchema.plugin(filter, { rules })

const model = mongoose.model('User', userSchema)
model.swaggerSchema = m2s(model)
export const schema = model.schema
export default model
