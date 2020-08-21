import { OK } from 'http-status-codes'
import { errorHandler } from 's/response'
import mbx from '@mapbox/mapbox-sdk/services/geocoding'
import { mapbox } from '~/config'
const { accessToken } = mapbox
const geocodingClient = mbx({ accessToken}) 

export const suggest = async ({ query }, res, next) => {
    try {
        const { body: { features }} = await geocodingClient.forwardGeocode({
            query: query.q,
            limit: 2,
            countries: ['DE']
        }).send()

        res.status(OK).json(features)
    } catch (error) {
        errorHandler(res, error)
    }
}