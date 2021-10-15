import _ from 'lodash'
import { withDependencies, named } from '@wix/thunderbolt-ioc'
import {
	Fetch,
	IFetchApi,
	SiteFeatureConfigSymbol,
	ILogger,
	LoggerSymbol,
	SdkHandlersProvider,
	BrowserWindow,
	BrowserWindowSymbol,
	DynamicSessionModel,
} from '@wix/thunderbolt-symbols'
import type {
	SessionManagerSiteConfig,
	ISessionManager,
	SessionHandlers,
	LoadNewSessionReason,
	OnLoadSessionCallback,
} from './types'
import { name } from './symbols'
import { DEFAULT_EXPIRATION_TIME } from './constants'

export const SessionManager = withDependencies(
	[BrowserWindowSymbol, named(SiteFeatureConfigSymbol, name), Fetch, LoggerSymbol],
	(
		browserWindow: BrowserWindow,
		siteFeatureConfig: SessionManagerSiteConfig,
		fetchApi: IFetchApi,
		logger: ILogger
	): ISessionManager & SdkHandlersProvider<SessionHandlers> => {
		let sessionTimeoutPointer: number

		const onLoadSessionCallbacks: Array<OnLoadSessionCallback> = []

		const addLoadNewSessionCallback = (callback: OnLoadSessionCallback) => {
			onLoadSessionCallbacks.push(callback)
		}

		const sessionModel: Partial<DynamicSessionModel> = {}

		browserWindow!.fetchDynamicModel.then((model) => {
			if (typeof model !== 'object') {
				logger.captureError(new Error(`failed fetching dynamicModel`), {
					tags: { feature: 'session-manager', fetchFail: 'dynamicModel' },
					extra: { errorMessage: model, attempt: 2 },
				})
				return
			}
			Object.assign(sessionModel, model)
		})

		const getAppInstanceByAppDefId = (
			appDefId: string,
			dynamicSessionModel: Partial<DynamicSessionModel>
		): string | undefined => {
			const { instance } = (dynamicSessionModel.apps && dynamicSessionModel.apps[appDefId]) || {}
			return instance
		}

		const invokeSessionLoadCallbacks = (reason: LoadNewSessionReason) => {
			const { apps, siteMemberId, visitorId, svSession } = sessionModel
			const instances = _.mapValues(apps, 'instance')

			onLoadSessionCallbacks.forEach((callback) => {
				callback({
					results: { instances, siteMemberId, visitorId, svSession },
					reason,
				})
			})
		}

		const loadNewSession: ISessionManager['loadNewSession'] = async (
			{ reason } = { reason: 'noSpecificReason' }
		) => {
			try {
				const newSession = await fetchApi
					.envFetch(siteFeatureConfig.dynamicModelApiUrl, { credentials: 'same-origin' })
					.then((res) => res.json())
				Object.assign(sessionModel, newSession)
				invokeSessionLoadCallbacks(reason)
			} catch (error) {
				logger.captureError(new Error(`failed fetching dynamicModel`), {
					tags: { feature: 'session-manager', fetchFail: 'dynamicModel' },
					extra: { errorMessage: error.message },
				})
			}

			setSessionTimeout()
		}

		const setSessionTimeout = () => {
			if (sessionTimeoutPointer) {
				browserWindow!.clearTimeout(sessionTimeoutPointer)
			}

			sessionTimeoutPointer = browserWindow!.setTimeout(
				() => loadNewSession({ reason: 'expiry' }),
				siteFeatureConfig.expiryTimeoutOverride || DEFAULT_EXPIRATION_TIME
			)
		}

		// set initial timeout for refresh
		setSessionTimeout()

		return {
			getAllInstances() {
				return sessionModel.apps || {}
			},
			getAppInstanceByAppDefId(appDefId: string) {
				return getAppInstanceByAppDefId(appDefId, sessionModel)
			},
			getSiteMemberId() {
				return sessionModel.siteMemberId
			},
			getVisitorId() {
				return sessionModel.visitorId
			},
			loadNewSession,
			addLoadNewSessionCallback,
			getHubSecurityToken() {
				return String(sessionModel.hs || 'NO_HS')
			},
			getUserSession() {
				return sessionModel.svSession
			},
			getCtToken() {
				return sessionModel.ctToken
			},
			setUserSession(svSession: string) {
				sessionModel.svSession = svSession
				// invokeSessionLoadCallbacks('newUserSession') // TODO potential breaking change, deserves it's own commit
			},
			getSdkHandlers: () => ({
				onLoadSession: (callback: OnLoadSessionCallback) => {
					addLoadNewSessionCallback(callback)
				},
				getMediaAuthToken: () => Promise.resolve(sessionModel.mediaAuthToken),
				loadNewSession,
			}),
		}
	}
)
