import { Router } from 'express'
import { webhook } from './controller'
import { mailchimpConfig } from '~/config'

const { webhookSecret } = mailchimpConfig
const router = new Router()

// Mailchimp webhook 
router.post(
    `/mailchimp/${webhookSecret}`,
    webhook
)

export default router
