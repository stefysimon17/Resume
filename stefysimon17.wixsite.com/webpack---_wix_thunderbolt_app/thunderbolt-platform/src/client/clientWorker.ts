import 'proxy-polyfill'
import type { PlatformLogger } from '@wix/thunderbolt-symbols'
import { expose } from 'comlink/dist/esm/comlink.js' // eslint-disable-line no-restricted-syntax
import { createCommonWorker } from '../worker-commons/clientWorker'
import { siteAssetsClientWorkerAdapter } from './initSiteAssetsClient'
import { fetchModelsFactory } from '../fetchModelsFactory'
import type { PlatformClientWorkerAPI } from '../core/types'

const { initPlatformOnSite, runPlatformOnPage } = createCommonWorker()

expose({
	initPlatformOnSite,
	runPlatformOnPage: (bootstrapData, updateProps, invokeSdkHandler, updateStyles) => {
		function modelsProviderFactory(logger: PlatformLogger) {
			const siteAssetsClient = siteAssetsClientWorkerAdapter(bootstrapData.platformEnvData, logger)
			return fetchModelsFactory({ siteAssetsClient, bootstrapData, logger })
		}

		return runPlatformOnPage({
			bootstrapData,
			updateProps,
			updateStyles,
			invokeSdkHandler,
			modelsProviderFactory,
		})
	},
} as PlatformClientWorkerAPI)
