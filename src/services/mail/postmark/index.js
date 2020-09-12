import { Client } from 'postmark'
import { postmark } from '~/config'

const client = new Client(postmark.apiKey)

const verificationLink = token => `${process.env.API_URL}/api/verification/${token}`
const passwordLink = token => `${process.env.APP_URL}/password-reset/${token}`
const loginLink = `${process.env.APP_URL}/login`

export const sendPasswordReset = async (To, name, token, os, browser) => {

    const { ErrorCode } = await client.sendEmailWithTemplate({
        From: postmark.defaultEmail,
        To,
        TemplateAlias: 'password-reset',
        TemplateModel: {
            name,
            action_url: passwordLink(token),
            operating_system: os,
            browser_name: browser        
        }
    })
    if (ErrorCode !== 0) {
        // log error
    }
    return ErrorCode === 0
}


export const sendVerification = async (To, name, token) => {
    const { ErrorCode } = await client.sendEmailWithTemplate({
        From: postmark.defaultEmail,
        To,
        TemplateAlias: 'welcome',
        TemplateModel: {
            product_url: process.env.APP_URL,
            product_name: 'Lokabees',
            name,
            action_url: verificationLink(token),
            login_url: loginLink,
            username: To,
            support_email: 'info@lokabees.com'
        }
    })
    if (ErrorCode !== 0) {
        // log error
    }
    return ErrorCode === 0
}
