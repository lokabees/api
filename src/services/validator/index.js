import { body, validationResult, matchedData } from 'express-validator'

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