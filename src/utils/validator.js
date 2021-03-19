import { intersection } from 'lodash'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

// lmao dont @ me
export const passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/
// eslint-disable-next-line max-len
export const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const instagramValidator = /^(?:(?:http|https):\/\/)?(?:www.)?instagram\.com\/[a-z\d-_]{1,255}\s*$/i

export const facebookValidator = /^(?:(?:http|https):\/\/)?(?:www.)?facebook\.com\/[a-z\d-_]{1,255}\s*$/i

export const websiteValidator = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/

export const cloudinaryValidator = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_/]+_[^,/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/

export const isObjectId = value => /^[0-9a-fA-F]{24}$/.test(value)

export const validatePhone = (number) => parsePhoneNumberFromString(number, 'DE').isValid()

const validSegmentRange = segment => (segment.open >= 0 && segment.open <= 1440) && (segment.close >= 0 && segment.close <= 1440)

export const HHMMtoMinutes = (hhmm) => {
    if (hhmm === undefined) return undefined
    const split = hhmm.split(':')
    if (split.length !== 2) throw 'invalid format'
    return (parseInt(split[0]) * 60) + parseInt(split[1])
}

export const minutesToHHMM = (minutes) => {
    const m = minutes % 60    
    const h = (minutes-m) / 60
    if (Number.isNaN(m) || Number.isNaN(h)) {
        return undefined
    }
    return `${h<10?'0':''}${h}:${m<10?'0':''}${m}`
}

export const openingHoursValidatorMongoose = {
    validator: function (openingHours) {
        try {
            return validateOpeningHours(openingHours)
        } catch (error) {
            return false            
        }
    },
    message: () => 'openinghours validation failed'
}

export const openingHoursValidatorExpress = (openingHours, { req, location, path }) => {
    try {
        const valid = validateOpeningHours(openingHours)
        if (!valid) throw new Error()
        return valid
    } catch (error) {
        throw new Error(req.__(`${path}.validation`))
    }
}

export const validateOpeningHours = (openingHours) => {
    const days = Object.keys(openingHours)

    for (const day of days) {
        const breaks = openingHours[day].breaks
        const open = openingHours[day].open
        const close = openingHours[day].close
    
        if (!open || !close) {
            continue
        }

        if (!validSegmentRange({ open, close }) || close <= open) {
            return false
        }

        const invalidValue = -1 !== breaks.findIndex(br => !validSegmentRange({ open: br.from, close: br.to }))
        if (invalidValue) {
            return false
        }

        if (breaks.length > 2) {
            return false
        }

        const badBreaks = breaks.filter(br => br.from >= br.to)
        if (badBreaks.length > 0) {
            return false
        }
    }    
    return true
}

export const parseOpeningHours = (openingHours) => {
    if (openingHours === undefined) return

    const parsed = { }
    const days = intersection(Object.keys(openingHours), ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])

    for (const day of days) {
        const { open, close } = openingHours[day]
        if (!open || !close) {
            parsed[day] = {
                breaks: []
            }
            continue
        }
        parsed[day] = {
            open: HHMMtoMinutes(open),
            close: HHMMtoMinutes(close),
            breaks: []
        }
        openingHours[day]?.breaks.forEach((br) => {
            parsed[day].breaks.push({
                from: HHMMtoMinutes(br.from),
                to: HHMMtoMinutes(br.to)
            })
        })
    }
    return parsed
}
