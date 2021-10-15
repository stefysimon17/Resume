import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	WixBiSessionSymbol,
	WixBiSession,
	IFetchApi,
	Fetch,
	ViewerModelSym,
	ExperimentsSymbol,
	ViewerModel,
	Experiments,
} from '@wix/thunderbolt-symbols'
import { commonBiLoggerFactory, frogUrlOverride } from '@wix/thunderbolt-commons'
import { SessionManagerSymbol, ISessionManager } from 'feature-session-manager'
import { BsiManagerSymbol } from './symbols'
import type { IBsiManager, BusinessLogger } from './types'
import { factory } from '@wix/fe-essentials-viewer-platform/bi'

declare global {
	interface Window {
		thunderboltVersion: string
	}
}

/**
 * BI logger for business events
 *
 * - Initialized with base defaults + bsi (which are supported globally in the BI schema).
 * - Any additional defaults should be added only after making sure the BI schema supports them.
 *
 * Usage: businessLogger.logger.log({src: <SRC>, evid: <EVID>, ...<PARAMS>}, {endpoint: <PROJECT ENDPOINT>})
 *
 * Please use #bi-logger-support for any questions
 */
export const BusinessLoggerFactory = withDependencies(
	process.env.browser
		? [WixBiSessionSymbol, SessionManagerSymbol, Fetch, BsiManagerSymbol, ViewerModelSym, ExperimentsSymbol]
		: [WixBiSessionSymbol, SessionManagerSymbol, Fetch],
	(
		wixBiSession: WixBiSession,
		sessionManager: ISessionManager,
		fetchApi: IFetchApi,
		bsiManager: IBsiManager,
		viewerModel: ViewerModel,
		experiments: Experiments
	): BusinessLogger => {
		const {
			initialTimestamp,
			initialRequestTimestamp,
			dc,
			viewerSessionId,
			requestId,
			is_rollout,
			isCached,
			msId,
			isjp,
			btype,
		} = wixBiSession

		const biStore = {
			...frogUrlOverride(experiments, viewerModel ? viewerModel.site.externalBaseUrl : ''),
			msid: msId,
			viewerSessionId,
			requestId,
			initialTimestamp,
			initialRequestTimestamp,
			dc,
			is_rollout,
			isCached,
			is_headless: isjp,
			is_headless_reason: btype,
			viewerVersion: process.env.browser ? window.thunderboltVersion : process.env.APP_VERSION!,
			rolloutData: {
				siteAssetsVersionsRollout: false,
				isDACRollout: false,
				isTBRollout: false,
			},
			pageData: {
				pageNumber: 0,
				pageId: '0',
				pageUrl: '0',
				isLightbox: false,
			},
		}

		const biLoggerFactory = commonBiLoggerFactory.createBaseBiLoggerFactory({
			biStore,
			sessionManager,
			useBatch: false,
			fetch: fetchApi.envFetch,
			factory,
		})

		if (process.env.browser) {
			biLoggerFactory.withNonEssentialContext({
				bsi: () => bsiManager.getBsi(),
			})
		}

		return {
			logger: biLoggerFactory.logger(),
		}
	}
)
