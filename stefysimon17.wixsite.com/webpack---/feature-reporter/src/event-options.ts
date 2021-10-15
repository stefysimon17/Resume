import { Experiments } from '@wix/thunderbolt-symbols'
import { FB_SERVER_EVENTS_SPECS } from './constants'
import type { ReporterSiteConfig } from './types'

export const enrichEventOptions = (options: object, experiments: Experiments, siteConfig: ReporterSiteConfig) => ({
	...options,
	isFBServerEventsEnabled: siteConfig.isFBServerEventsAppProvisioned,
	useStoresPurchaseFBServerEvent: experiments[FB_SERVER_EVENTS_SPECS.STORES_PURCHASE],
	useEventsPurchaseFBServerEvent: experiments[FB_SERVER_EVENTS_SPECS.EVENTS_PURCHASE],
	useBookingsPurchaseFBServerEvent: experiments[FB_SERVER_EVENTS_SPECS.BOOKINGS_PURCHASE],
})
