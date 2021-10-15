import _ from 'lodash'
import { proxy } from 'comlink/dist/esm/comlink.js' // eslint-disable-line no-restricted-syntax
import { createDeepProxy } from '../deepProxyUtils'
import type { PlatformLogger } from '@wix/thunderbolt-symbols'
import { manager as biLoggersManager } from '@wix/fe-essentials-viewer-platform/bi'
import type { Logger } from '@wix/fe-essentials-viewer-platform/bi'
import type { BootstrapData, InitPlatformOnSiteArgs, ViewerAPI } from '../types'
import { initWorkerOnSite, runWorkerOnPage } from '../core/worker'
import { clearTimeouts } from '../client/timeoutsManager'
import { fetchModels, PlatformWorkerCommonApi, ScriptCache } from '../core/types'
import moduleLoaderFactory from '../core/loadModules'
import SessionServiceFactory from '../core/sessionService'

const scriptsCache: ScriptCache = {}
self.addEventListener(
	'message',
	(messageEvent) => {
		if (messageEvent.data?.type !== 'platformScriptsToPreload') {
			return
		}
		const moduleLoader = moduleLoaderFactory({ scriptsCache, experiments: messageEvent.data.experiments })

		_(messageEvent.data.appScriptsUrls).values().flatten().each(moduleLoader.loadModule)
	},
	{ once: true }
)

const originalConsoleProperties = { ...self.console }
const restoreOriginalConsoleProperties = () => Object.assign(self.console, originalConsoleProperties)

export function createCommonWorker(): PlatformWorkerCommonApi {
	const webBiLoggers: Array<Logger> = []
	// @ts-ignore
	biLoggersManager.onLoggerCreated((logger: Logger) => webBiLoggers.push(logger))

	function initPlatformOnSite({ platformEnvData, appsUrlData }: InitPlatformOnSiteArgs) {
		restoreOriginalConsoleProperties()
		initWorkerOnSite({
			platformEnvData,
			appsUrlData,
		})
	}

	async function runPlatformOnPage({
		bootstrapData,
		updateProps,
		updateStyles,
		invokeSdkHandler,
		modelsProviderFactory,
	}: {
		bootstrapData: BootstrapData
		updateProps: ViewerAPI['updateProps']
		updateStyles: ViewerAPI['updateStyles']
		invokeSdkHandler: ViewerAPI['invokeSdkHandler']
		modelsProviderFactory: (logger: PlatformLogger) => fetchModels
	}) {
		// Clear timeouts on navigation, after leaving the first page.
		// This should be done per page (Also when lightbox closes) Will be done on https://jira.wixpress.com/browse/PLAT-1219
		const { isLightbox, pageNumber } = bootstrapData.platformEnvData.bi.pageData
		if (pageNumber > 1 && !isLightbox) {
			// The bi loggers are flushing themselves with timeouts. So we need to explicitly flush and await them to
			// avoid destroying their batching with clearTimeouts().
			await Promise.all(webBiLoggers.map((logger) => logger.flush()))
			webBiLoggers.length = 0
			clearTimeouts()
		}

		const arrayOfUpdatePromises: Array<Promise<any> | void> = []
		const viewerAPI: ViewerAPI = {
			updateProps: (data: any) => {
				const promise = updateProps(data)
				arrayOfUpdatePromises.push(promise)
			},
			updateStyles: (data: any) => {
				const promise = updateStyles(data)
				arrayOfUpdatePromises.push(promise)
			},
			invokeSdkHandler: (pageId, path, ...args) => {
				if (args.length > 4) {
					console.error('sdk handlers support up to 4 arguments')
					return
				}
				const proxiedArgs = args.map((arg: never) => (_.isFunction(arg) ? proxy(arg) : arg))
				const promise = invokeSdkHandler(pageId, path, proxiedArgs[0], proxiedArgs[1], proxiedArgs[2], proxiedArgs[3])
				const functionName = _.last(path) as string
				if (functionName === 'setControllerProps') {
					arrayOfUpdatePromises.push(promise)
				}
				return promise
			},
		}

		const sessionService = SessionServiceFactory({
			platformEnvData: bootstrapData.platformEnvData,
			handlers: createDeepProxy((path: Array<string>) => (...args: Array<never>) => viewerAPI.invokeSdkHandler(bootstrapData.currentPageId, path, ...args)),
		})

		await runWorkerOnPage({
			viewerAPI,
			bootstrapData,
			modelsProviderFactory,
			scriptsCache,
			sessionService,
		})

		// wait for all prop updates to finish before resolving the main platform promise to make sure props are updated before render
		await Promise.all(arrayOfUpdatePromises)
	}

	return {
		initPlatformOnSite,
		runPlatformOnPage,
	}
}
