import { get } from '../../common/api'
import { mapAvailabilityOptionsToAvailabilityRequest } from '../service-availability.mapper'
import { validateGeneralStatus, validateStatus } from '../../common/error-handler'

export function getAvailability(serviceId, availabilityOptions) {
	const apiUrl = `/service/${serviceId}/availability`
	const mappedOptions = mapAvailabilityOptionsToAvailabilityRequest(availabilityOptions)
	return get(apiUrl, mappedOptions)
		.then((res) => validateGeneralStatus(res))
		.then((res) => res.json())
		.then((res) => validateStatus(res))
}
