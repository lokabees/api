import { Client } from 'postmark'
import { postmark } from '~/config'

const client = new Client(postmark.apiKey)

export const sendPasswordReset = (To, name, token) => {
    // TODO
}


export const sendVerification = async (To, name, token) => {
    const { ErrorCode, Message } = await client.sendEmailWithTemplate({
        From: postmark.defaultEmail,
        To,
        TemplateAlias: 'welcome',
        TemplateModel: { // TODO:
          product_url: 'product_url_Value',
          product_name: 'product_name_Value',
          name: 'name_Value',
          action_url: 'action_url_Value',
          login_url: 'login_url_Value',
          username: 'username_Value',
          trial_length: 'trial_length_Value',
          trial_start_date: 'trial_start_date_Value',
          trial_end_date: 'trial_end_date_Value',
          support_email: 'support_email_Value',
          live_chat_url: 'live_chat_url_Value',
          sender_name: 'sender_name_Value',
          help_url: 'help_url_Value',
          company_name: 'company_name_Value',
          company_address: 'company_address_Value'
        }
    })
    if (ErrorCode !== 0) {
        // log error
    }
    return ErrorCode === 0
}
