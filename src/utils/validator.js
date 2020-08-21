// lmao dont @ me
export const passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#?$%^&*])(?=.{8,})/
// eslint-disable-next-line max-len
export const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const instagramValidator = /^(?:(?:http|https):\/\/)?(?:www.)?instagram\.com\/[a-z\d-_]{1,255}\s*$/i

export const facebookValidator = /^(?:(?:http|https):\/\/)?(?:www.)?facebook\.com\/[a-z\d-_]{1,255}\s*$/i

export const websiteValidator = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/

export const cloudinaryValidator = /^.+\.cloudinary\.com\/(?:[^\/]+\/)(?:(image|video)\/)?(?:(upload|fetch)\/)?(?:(?:[^_/]+_[^,/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^\.^\s]+)(?:\.(.+))?$/

export const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value)