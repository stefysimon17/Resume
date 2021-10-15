import { channelNames } from '@wix/promote-analytics-adapter'
import { BusinessLogger, Experiments } from '@wix/thunderbolt-symbols'
import { IConsentPolicy } from 'feature-consent-policy'
import { decorateReporter } from './decorateReporter'
import type { BiProps } from './types'
import { wixPerformanceMeasurements } from '../wix-perf-measurements'
import { getUtmParams } from '../utm-params'
import { isUserConsentProvided } from '../utils'
import { PROMOTE_BI_ENDPOINT, PURCHASE_EVENT, PV_EVENT } from './constants'

export const getDefaultChannels = (
	biProps: BiProps,
	businessLogger: BusinessLogger,
	experiments: Experiments,
	consentPolicy: IConsentPolicy
) => {
	return [
		{
			name: channelNames.BI_ANALYTICS,
			report: decorateReporter(biProps, channelNames.BI_ANALYTICS, (params: any) => {
				const isPageViewEvent = params.src === PV_EVENT.SRC && params.evid === PV_EVENT.EVID && params.pn === 1
				const isPurchseEvent = params.src === PURCHASE_EVENT.SRC && params.evid === PURCHASE_EVENT.EVID
				if (isPageViewEvent) {
					wixPerformanceMeasurements(experiments)
						.then(({ tti, lcp, cls }) => {
							log({
								...params,
								tti,
								...(typeof lcp !== 'undefined' && { lcp }),
								...(typeof cls !== 'undefined' && { cls }),
							})
						})
						.catch(() => {
							log(params)
						})
				} else if (isPurchseEvent) {
					const utmParams = getUtmParams(experiments)
					log({
						...params,
						...(utmParams &&
							isUserConsentProvided(consentPolicy) && { utmData: JSON.stringify(utmParams) }),
					})
				} else {
					log(params)
				}
			}),
		},
	]

	function log(params: object) {
		businessLogger.logger.log(params, { endpoint: PROMOTE_BI_ENDPOINT })
	}
}
