import mailchimp from "@mailchimp/mailchimp_marketing";
import { mailchimpConfig, env } from '~/config'
const { secret, list, prefix } = mailchimpConfig

mailchimp.setConfig({
    apiKey: secret,
    server: prefix,
});

export const subscribeUser = async (email, type) => {
    if (env !== 'production') {
        return
    }
    const response = await mailchimp.lists.addListMember(list, {
        email_address: email,
        status: "subscribed",
        merge_fields: {
            TYPE: type,
        }
    }).catch((error => {
        console.log(error)
    }))
    return response?.id
}

export const unsubscribeUser = async (newsletterId) => {
    if (env !== 'production' || !isSubscribed(newsletterId)) {
        return
    }
    const response = await mailchimp.lists.updateListMember(
        list,
        newsletterId,
        {
            status: "unsubscribed"
        }
    ).catch((error) => {
        console.log(error)
    })
}

const isSubscribed = async (newsletterId) => {
    try {
        const response = await mailchimp.lists.getListMember(
            listId,
            subscriberHash
        )
        return response.status === 'subscribed'
    } catch (error) {
        if (error.status === 404) {
            return false
        }
        console.log(error)
    }
}   