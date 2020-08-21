import { intersection } from 'lodash'

// lmao dont @ me
export const passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#?$%^&*])(?=.{8,})/
// eslint-disable-next-line max-len
export const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const instagramValidator = /^(?:(?:http|https):\/\/)?(?:www.)?instagram\.com\/[a-z\d-_]{1,255}\s*$/i

export const facebookValidator = /^(?:(?:http|https):\/\/)?(?:www.)?facebook\.com\/[a-z\d-_]{1,255}\s*$/i

export const websiteValidator = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/

export const cloudinaryValidator = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_/]+_[^,/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/

export const isObjectId = value => /^[0-9a-fA-F]{24}$/.test(value)



/*
Rules: 
    0. Only 10 time segments per day (everything else is kinda fishy)
  0,5. Each segment value between 0 and 1440
    1. Don't allow other time segments if it is supposed to be open all day (open = close = 0)
    2. No time segment should have oepn >= close
  2.5. No weird intersections
    3. Only 365 exceptions
    
*/


// This part is mostly copied from the old getit codebase:

const validSegmentRange = segment => (segment.open >= 0 && segment.open <= 1440) && (segment.close >= 0 && segment.close <= 1440)

export const HHMMtoMinutes = (hhmm) => {
    const split = hhmm.split(':')
    if (split.length !== 2) throw 'invalid format'
    return (parseInt(split[0]) * 60) + parseInt(split[1])
}

export const minutesToHHMM = (minutes) => {
    const m = minutes % 60    
    const h = (minutes-m) / 60
    return `${h<10?'0':''}${h}:${m<10?'0':''}${m}`
}

const validateOpeningHours = (openingHours) => {
    const days = Object.keys(openingHours)

    for (const day of days) {
        const segments = openingHours[day]

        // Rule 0
        if (segments.length > 2) {
            console.log('meh')
            return false
        }

        // Rule 0,5
        const invalidValue = -1 !== segments.findIndex(segment => !validSegmentRange(segment))
        if (invalidValue) {
            console.log('meh1')
            return false
        }

        // Rule 1
        const allDayOpen = -1 !== segments.findIndex(segment => segment.open === 0 && segment.close === 0)
        if (allDayOpen && segments.length > 1) {
            console.log('meh2')
            return false
        }

        // Rule 2
        const badSegments = segments.filter(segment => segment.open >= segment.close)
        if (!allDayOpen && badSegments.length > 0) {
            console.log('meh3')
            return false
        }
    }    
    return true
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

export const parseOpeningHours = (openingHours) => {
    if (openingHours === undefined) return
    
    const parsed = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }

    const days = intersection(Object.keys(openingHours), ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
 
    for (const day of days) {
        parsed[day] = []
        const segments = openingHours[day]
        for (let index = 0; index < segments.length; index += 1) {
            const segment = segments[index]
            parsed[day].push({ open: HHMMtoMinutes(segment.open), close: HHMMtoMinutes(segment.close)})
        } 

    }
    return parsed
}
