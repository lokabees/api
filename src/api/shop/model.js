import m2s from 'mongoose-to-swagger'
import moment from 'moment-timezone'
import mongoose, { Schema } from 'mongoose'
import { paginate, filter, ownership } from 's/mongoose'
import rules from './acl'
import userAcl from 'a/user/acl'
import slugify from 'slugify'
import { facebookValidator, instagramValidator, emailValidator, websiteValidator, openingHoursValidatorMongoose as openingHoursValidator, minutesToHHMM } from '~/utils/validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { User } from 'a/user'
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
        delivery: {
            localDelivery: { type: Boolean, default: false },
            pickUp: { type: Boolean, default: false },
            mail: { type: Boolean, default: false }
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
        // figure out how to do i18n
        address: {
            country: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: Number, required: true },
            street: { type: String, required: true },
            number: { type: String, required: true },
            optional: { type: String, required: false },
            locality: { type: String, required: false },
            geometry: {
                type: {
                    type: String,
                    required: true
                },
                coordinates: [{
                    type: Number,
                    required: true
                }]
            }
        },
        images: {
            cover: {
                url: { type: String, default: 'cdn-link' },
                id: { type: String, default: 'placeholder' }
            },
            profile: {
                url: { type: String, default: 'cdn-link' },
                id: { type: String, default: 'placeholder' }
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
            required: true,
            description: 'unpublished shops will not be accessible for the public (only owner+author+admin)'
        },
        categories: [
            {
                type: 'ObjectId',
                ref: 'ShopCategory'
            }
        ],
        parsedOpeningHours: {
            type: Object,
            monday: [{ open: { type: Number }, close: { type: Number } }],
            tuesday: [{ open: { type: Number }, close: { type: Number } }],
            wednesday: [{ open: { type: Number }, close: { type: Number } }],
            thursday: [{ open: { type: Number }, close: { type: Number } }],
            friday: [{ open: { type: Number }, close: { type: Number } }],
            saturday: [{ open: { type: Number }, close: { type: Number } }],
            sunday: [{ open: { type: Number }, close: { type: Number } }],
            validate: openingHoursValidator,
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

shopSchema.virtual('isOpen').get(function () {
    if (Object.keys(this.parsedOpeningHours).length === 0) {
        return false
    }
    moment.locale('de')
    const date = new Date()
    const day = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ][date.getDay()]

    const minutes = moment().tz('Europe/Berlin').hours() * 60 + moment().minutes()

    if (this.parsedOpeningHours[day].length === 0) {
        return false // all day closed
    }

    if (this.parsedOpeningHours[day][0].open === 0 && this.parsedOpeningHours[day][0].close === 0) {
        return true // all day open
    }

    const isOpen = this.parsedOpeningHours[day].findIndex((segment) => {
        return segment.open <= minutes && minutes <= segment.close
    }) !== -1

    return isOpen

})

shopSchema.virtual('openingHours').get(function () {

    const openingHours = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    }

    if (this.parsedOpeningHours === undefined) {
        return openingHours
    }
    const days = Object.keys(this.parsedOpeningHours)

    days.forEach((day) => {
        openingHours[day] = []
        this.parsedOpeningHours[day].forEach((segment) => {
            openingHours[day].push({
                allDayOpen: segment.open === 0 && segment.close === 0,
                open: minutesToHHMM(segment.open),
                close: minutesToHHMM(segment.close),
            })
        })
    })

    return openingHours

})

shopSchema.post('save', async function(shop) {
    const userId = shop.author
    const user = await User.findById(userId)
    // if its a new shop, set it as active and add to shop list
    if (!user.shops.includes(shop._id)) {
        await User.updateOne({ _id: userId }, { activeShop: shop._id, $push: { shops: shop._id }})
    }
})


// Find a unique slug if name changed
shopSchema.pre('validate', async function(next) {
    
    if (!this.isModified('name')) {
        return next()
    }

    let slug = slugify(this.name, { lower: true })
    let slugExists = await model.exists({ slug })
    while (slugExists || slug === 'categories') {
        const rnd = Math.round(Math.random() * 1000)
        slug = slugify(this.name + rnd, { lower: true })
        slugExists = await model.exists({ slug })
    }
    this.slug = slug

    next()
})

shopSchema.plugin(filter, { rules })
shopSchema.plugin(paginate, { rules, populateRules: { author: userAcl } })
shopSchema.plugin(ownership)

const model = mongoose.model('Shop', shopSchema)
model.swaggerSchema = m2s(model)

const shopCategorySchema = new Schema(
    {
        name: {
            type: String,
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
const categoryModel = mongoose.model('ShopCategory', shopCategorySchema, 'shop_categories')

export const ShopCategory = categoryModel
export const schema = model.schema
export default model
