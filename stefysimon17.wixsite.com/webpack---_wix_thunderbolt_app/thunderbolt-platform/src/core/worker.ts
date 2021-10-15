import { FetchFn, PlatformEnvData, PlatformLogger, ViewerAppsUrls, CommonConfig, SessionServiceAPI } from '@wix/thunderbolt-symbols'
import { BatchedUpdateFunction, BootstrapData, ViewerAPI } from '../types'
import { createPlatformAPI } from './index'
import moduleLoaderFactory from './loadModules'
import { batchUpdateFactory } from './batchUpdate'
import { platformLoggerCreator } from './platformLoggerFactory'
import { fetchModels, ScriptCache } from './types'
import { fetchEval } from './fetchEval'

declare const self: {
	importScripts: (url: string) => void
	onmessage: (msg: MessageEvent) => void
	XMLHttpRequest: any
	fetch: FetchFn
	location: Location
	commonConfig: CommonConfig
}

if (self.location && self.location.protocol === 'blob:') {
	/*  blob protocol is used to overcome CORS issue when creating WebWorker.
		fetch will not apply host protocol to requests starting with '//' when host protocol is blob so it must be fixed
		manually */
	const getAbsoluteUrl = (url: string) => {
		if (url.startsWith('//')) {
			return `https:${url}`
		}

		if (url.startsWith('/')) {
			return `${self.location.origin}${url}`
		}

		return url
	}

	const originalFetch = self.fetch.bind(self)
	self.fetch = (url: string, requestInit?: RequestInit) => originalFetch(getAbsoluteUrl(url), requestInit)

	const originalOpen = self.XMLHttpRequest.prototype.open
	self.XMLHttpRequest.prototype.open = function (method: string, url: string, ...args: Array<never>) {
		return originalOpen.call(this, method, getAbsoluteUrl(url), ...args)
	}
}

const { initPlatformOnSite, runPlatformOnPage } = createPlatformAPI()

export function initWorkerOnSite({ platformEnvData, appsUrlData }: { platformEnvData: PlatformEnvData; appsUrlData: ViewerAppsUrls }) {
	const logger = platformLoggerCreator({
		sessionService: {
			getVisitorId: () => platformEnvData.session.visitorId,
			getSiteMemberId: () => platformEnvData.session.siteMemberId,
		},
		biData: platformEnvData.bi,
		site: platformEnvData.site,
		location: platformEnvData.location,
		appsUrlData,
		isSSR: platformEnvData.window.isSSR,
	})
	initPlatformOnSite({ logger, platformEnvData })
}

export async function runWorkerOnPage({
	bootstrapData,
	viewerAPI,
	scriptsCache = {},
	modelsProviderFactory,
	sessionService,
}: {
	bootstrapData: BootstrapData
	viewerAPI: ViewerAPI
	scriptsCache?: ScriptCache
	modelsProviderFactory: (logger: PlatformLogger) => fetchModels
	sessionService: SessionServiceAPI
}) {
	const {
		appsUrlData,
		platformEnvData: {
			commonConfig,
			window: { isSSR },
			bi: biData,
			location,
			site,
		},
	} = bootstrapData

	const moduleLoader = moduleLoaderFactory({ scriptsCache, experiments: site.experiments })
	self.commonConfig = commonConfig
	const flushes: Array<() => void> = []

	const createBatchedUpdate = (updateFunc: BatchedUpdateFunction) => {
		const { batchUpdate, flushUpdates } = batchUpdateFactory(updateFunc)
		flushes.push(flushUpdates)
		return batchUpdate
	}
	viewerAPI.updateProps = createBatchedUpdate(viewerAPI.updateProps)
	viewerAPI.updateStyles = createBatchedUpdate(viewerAPI.updateStyles)

	const logger: PlatformLogger = platformLoggerCreator({ sessionService, biData, location, site, appsUrlData, isSSR })

	await runPlatformOnPage({
		sessionService,
		bootstrapData,
		viewerAPI,
		moduleLoader,
		importScripts: site.experiments['specs.thunderbolt.fetchEvalInWorker'] ? fetchEval : self.importScripts,
		logger,
		fetchModels: modelsProviderFactory(logger),
	})

	flushes.forEach((flush) => flush())
}
