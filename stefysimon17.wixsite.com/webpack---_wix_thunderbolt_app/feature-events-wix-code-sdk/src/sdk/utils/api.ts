import { EVENTS_API_PATH_AMBASSADOR } from '../constants'
import { loadAmbassadorWixEventsWebHttp } from '../dynamic-imports'

type GetHeadersCallback = () => HeadersInit

let getRequestHeaders: GetHeadersCallback
let urlPrefix: string = ''

export const prepareEventsApi = (getHeaders: GetHeadersCallback, url: URL) => {
	getRequestHeaders = getHeaders
	urlPrefix = `${url.protocol}//${url.hostname}`
}

export const EventsApi = async () => {
	const api = (await loadAmbassadorWixEventsWebHttp()).WixEventsWeb(`${urlPrefix}${EVENTS_API_PATH_AMBASSADOR}`)
	return {
		RsvpManagement: () => api.RsvpManagement()(getRequestHeaders()),
		EventManagement: () => api.EventManagement()(getRequestHeaders()),
		CheckoutService: () => api.CheckoutService()(getRequestHeaders()),
	}
}
