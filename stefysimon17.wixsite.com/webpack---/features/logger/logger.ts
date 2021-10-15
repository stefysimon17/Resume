import _ from 'lodash'
import { ContainerModuleLoader, withDependencies } from '@wix/thunderbolt-ioc'
import {
	LoggerSymbol,
	ILogger,
	LoggerIntegrations,
	IRendererPropsExtender,
	RendererPropsExtenderSym,
} from '@wix/thunderbolt-symbols'
import { Environment } from '../../types/Environment'
import { create } from '@wix/fe-essentials-viewer-platform/fedops'
import {
	commonBiLoggerFactory,
	createFedopsLogger,
	getBiStore,
	createConsoleLogger,
	getEnvironment,
} from '@wix/thunderbolt-commons'
import { factory } from '@wix/fe-essentials-viewer-platform/bi'
// @ts-ignore
import { createLoggerApi } from '@wix/thunderbolt-logger'

export function createLogger(loggerIntegrations: LoggerIntegrations): ILogger {
	const { sentry, wixBiSession, viewerModel, fetch } = loggerIntegrations
	const mode = viewerModel && viewerModel.mode ? viewerModel.mode : { qa: true }
	const isSsr = !process.env.browser
	if (mode.qa || !sentry) {
		return createConsoleLogger()
	}

	const biStore = getBiStore(wixBiSession, viewerModel)
	const biLoggerFactory = commonBiLoggerFactory.createBiLoggerFactoryForFedops({
		sessionManager: {
			getVisitorId: _.noop,
			getSiteMemberId: _.noop,
		},
		biStore,
		fetch,
		muteBi: viewerModel.requestUrl.includes('suppressbi=true'),
		factory,
	})
	const fedopsLogger = createFedopsLogger({
		biLoggerFactory,
		phasesConfig: 'SEND_START_AND_FINISH',
		appName: viewerModel.site && viewerModel.site.isResponsive ? 'thunderbolt-responsive' : 'thunderbolt',
		reportBlackbox: true,
		paramsOverrides: { is_rollout: biStore.is_rollout },
		factory: create,
	})
	const sentryStore = {
		release: process.env.browser ? window.thunderboltVersion : process.env.APP_VERSION,
		environment: getEnvironment(viewerModel.fleetConfig.code),
		user: `${wixBiSession.viewerSessionId}`,
	}
	const logger = createLoggerApi({
		fedopsLogger,
		sentry,
		sentryStore,
		shouldMuteErrors: biStore.isCached || wixBiSession.isjp,
		errorLimit: 50,
		isSsr,
	})
	if (!isSsr) {
		addEventListener(
			'offline',
			() => {
				logger.meter('offline')
			},
			true
		)
		addEventListener(
			'online',
			() => {
				logger.meter('online')
			},
			true
		)
		let pageVisibilty = 'visible'
		const pagehide = () => {
			const { visibilityState } = document
			if (visibilityState !== pageVisibilty) {
				pageVisibilty = visibilityState
				logger.meter(visibilityState)
			}
		}
		addEventListener('pagehide', pagehide, true)
		addEventListener('visibilitychange', pagehide, true)
		pagehide()
	}
	sentry.configureScope((scope: any) => {
		scope.addEventProcessor((event: any, hint?: any) => {
			const { message, name } = hint.originalException
			if (name && name.indexOf('ChunkLoadError') > -1) {
				event.fingerprint = ['ChunkLoadError']
			}
			if (event.level === 'error') {
				logger.meter('error', {
					paramsOverrides: {
						evid: 26,
						errorInfo: message,
						errorType: name,
						eventString: hint.event_id,
						tags: event.tags,
					},
				}) // this is a workaround to get error rate until we will have support for postgresSQL in fedonomy
			}

			return event
		})
	})

	logger.setGlobalsForErrors({
		tags: { url: viewerModel.requestUrl, isSsr: !process.env.browser, ...viewerModel.deviceInfo },
		extra: { experiments: viewerModel.experiments },
	})
	return logger
}

const rendererPropsExtender = withDependencies(
	[LoggerSymbol],
	(logger: ILogger): IRendererPropsExtender => {
		return {
			async extendRendererProps() {
				return { logger }
			},
		}
	}
)

export const site = ({ logger }: Environment): ContainerModuleLoader => (bind) => {
	bind(LoggerSymbol).toConstantValue(logger)
	bind(RendererPropsExtenderSym).to(rendererPropsExtender)
}
