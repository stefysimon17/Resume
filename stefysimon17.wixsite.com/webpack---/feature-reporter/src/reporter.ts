import { withDependencies, named } from '@wix/thunderbolt-ioc'
import type { IReporterApi, ReporterSiteConfig, ReporterState } from './types'
import { IFeatureState } from 'thunderbolt-feature-state'
import { SessionManagerSymbol, ISessionManager } from 'feature-session-manager'

import { name } from './symbols'
import { FeatureStateSymbol, SiteFeatureConfigSymbol, ExperimentsSymbol, Experiments } from '@wix/thunderbolt-symbols'
import { enrichEventOptions } from './event-options'
import { resolveEventParams } from './resolve-event-params'

const reporterFactory = (
	featureState: IFeatureState<ReporterState>,
	siteConfig: ReporterSiteConfig,
	experiments: Experiments,
	sessionManager: ISessionManager
): IReporterApi => ({
	trackEvent: async (event, { reportToChannelsOnly, reportToListenersOnly } = {}) => {
		const { eventName, params = {}, options = {} } = event
		const eventParams = resolveEventParams(params as Record<string, string>, sessionManager)
		const eventOptions = enrichEventOptions(options, experiments, siteConfig)
		const api = await import('./api' /* webpackChunkName: "reporter-api" */)

		if (reportToListenersOnly) {
			return api.trackEventToListenersOnly(eventName, eventParams, eventOptions)
		}

		if (reportToChannelsOnly) {
			api.trackEventToChannelsOnly(eventName, eventParams, eventOptions)
		} else {
			api.trackEvent(eventName, eventParams, eventOptions)
		}
	},
})

export const Reporter = withDependencies(
	[named(FeatureStateSymbol, name), named(SiteFeatureConfigSymbol, name), ExperimentsSymbol, SessionManagerSymbol],
	reporterFactory
)
