import { OK, NOT_FOUND } from 'http-status-codes'
import { errorHandler } from 's/response'
import mbx from '@mapbox/mapbox-sdk/services/geocoding'
import { mapbox } from '~/config'
const { accessToken } = mapbox
const geocodingClient = mbx({ accessToken})
const findContext = (feature, context) => feature.context.find(c => c.id.startsWith(`${context}.`))?.text

export const suggest = async ({ query }, res, next) => {
    try {
        const { body: { features }} = await geocodingClient.forwardGeocode({
            query: query.q,
            limit: 1,
            countries: ['DE'],
            language: ['DE']
        }).send()

        // we kinda want to filter the huge response object...
        if (features.length === 0) {
            res.status(NOT_FOUND).end()
            return
        }
        const feature = features[0]
        const data = {
            name: feature.place_name,
            geometry: feature.geometry,
            number: feature.address,
            street: feature.text,
            postcode: findContext(feature, 'postcode'),
            city: findContext(feature, 'place'),
            state: findContext(feature, 'region'),
            country: findContext(feature, 'country'),
            locality: findContext(feature, 'locality')
        }

        res.status(OK).json(data)
    } catch (error) {
        errorHandler(res, error)
    }
}