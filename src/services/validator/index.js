import { body, validationResult, matchedData } from 'express-validator'

// this is chaos
export const validator = (schema) => {
    const middleware = []

    Object.keys(schema).forEach((key) => {
        let v = body(key)

        // ignore fields with default value for now
        if (schema[key].default !== undefined) return
        // If key got default value it is not required.
        // If key got default value and the value is undefined, we do not need to check
        // If key got default value and the value is not undefined, we do need to check
        if (schema[key].required) {
            v = v.exists()
        }


        if (Object.keys(schema[key].validate ?? {}).length === 2) {
            v = v.custom(value => {
                if (!schema[key].validate.validator(value)) {
                    throw new Error(schema[key].validate.message)
                }
                return true
            })

        }
        
        

        middleware.push(v)
    })

    return middleware
}

export const expressValidatorErrorChain = (req, res, next) => {
    const err = validationResult(req)
    if (!err.isEmpty()) {
        res.status(400).json(err.mapped()).end()
        return
    }
    next()
}

const removeEmpty = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
            removeEmpty(obj[key]) 
        } else if (obj[key] === undefined) {
            delete obj[key]
        }
    })
    return obj
}

export const onlyAllowMatched = (req, res, next) => {
    req.body = removeEmpty(matchedData(req, { includeOptionals: true }))
    next()
}