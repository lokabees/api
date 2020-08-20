import m2s from 'mongoose-to-swagger'
import mongoose, { Schema } from 'mongoose'
import { paginate, filter, ownership } from 's/mongoose'
import rules from './acl'
import userAcl from 'a/user/acl'
import slugify from 'slugify'
import { facebookValidator, instagramValidator, emailValidator, websiteValidator } from '~/utils/validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { hereConfig } from '~/config'
import request from 'request-promise'
// schema for shop
const shopSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            validate: {
                validator: value => value.length > 0,
                message: _ => 'name is too short'
            }
        },
        slug: {
            type: String, 
            unique: true
        },
        contact: new Schema({
            website: {
                type: String,
                validate: {
                    validator: value => websiteValidator.test(value),
                    message: _ => 'Website URI is invalid'
                }
            },
            facebook: {
                type: String,
                validate: {
                    validator: value => facebookValidator.test(value),
                    message: _ => 'Facebook URI is invalid'
                }
            },
            instagram: {
                type: String,
                validate: {
                    validator: value => instagramValidator.test(value),
                    message: _ => 'Instagram URI is invalid'
                }
            },
            phone: {
                type: String,
                validate: {
                    validator: value => parsePhoneNumberFromString(value).isValid(),
                    message: _ => 'Phone is invalid'
                }  
            }, 
            email: {
                type: String,
                validate: {
                    validator: value => emailValidator.test(value),
                    message: _ => 'Email is invalid'
                }  
            }
        }),
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
            displayPosition: {
                latitude: {
                    type: Number,
                    required: true
                },
                longitude: {
                    type: Number,
                    required: true
                }
            }
        },
        author: {
            type: 'ObjectId',
            ref: 'User',
            required: true,
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

// Find a unique slug if name changed
shopSchema.pre('validate', async function(next) {
    
    if (!this.isModified('name')) {
        return next()
    }

    let slug = slugify(this.name, { lower: true })
    let slugExists = await model.exists({ slug })
    while (slugExists) {
        const rnd = Math.round(Math.random() * 1000)
        slug = slugify(this.name + rnd, { lower: true })
        slugExists = await model.exists({ slug })
    }
    this.slug = slug

    next()
})

// request adress data if locationId changed
shopSchema.pre('validate', async function(next) {
    if (!this.isModified('address.locationId')) {
        next()
        return
    }
    
    // HERE API request
    try {
        const res = await request({
            uri: `https://geocoder.ls.hereapi.com/6.2/geocode.json?locationid=${this.address.locationId}&jsonattributes=1&gen=9&apiKey=${hereConfig.apiKey}`,
            json: true,
        })
        const {
            response: {
                view: [
                    {
                        result: [
                            {
                                location
                            },
                        ],
                    },
                ],
            },
        } = res
        this.address = location.address
        this.address.locationId = location.locationId
        this.address.displayPosition = location.displayPosition
    } catch(error) {
        /*
        How do we handle errors?
            1. Retry here request
            2. Fail with 500
            3. Make adress optional, dont allow publishing
        */
        return next(error)
    }
})

shopSchema.virtual('address.display').get(function () {
    return `${this.address.street} ${this.address.houseNumber}, ${this.address.postalCode} ${this.address.city}`
})

shopSchema.plugin(filter, { rules })
shopSchema.plugin(paginate, { rules, populateRules: { author: userAcl } })
shopSchema.plugin(ownership)

const model = mongoose.model('Shop', shopSchema)
model.swaggerSchema = m2s(model)
export const schema = model.schema

export default model
