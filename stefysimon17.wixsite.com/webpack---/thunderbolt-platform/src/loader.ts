import {
	LifeCycle,
	PlatformEvnDataProviderSymbol,
	PlatformStorageSymbol,
	PlatformSymbol,
	PlatformViewportAPISym,
	PlatformWorkerPromiseSym,
	WixCodeSdkHandlersProviderSym,
} from '@wix/thunderbolt-symbols'
import { UrlChangeHandlerForPage } from 'feature-router'
import { PlatformInitializerSym } from './symbols'
import type { PlatformInitializer } from './types'
import { Platform } from './platform'
import { ContainerModuleLoader, FactoryWithDependencies } from '@wix/thunderbolt-ioc'
import { Storage } from './storage/storage'
import * as platformEnvDataProviders from './platformEnvData/platformEnvData'
import { biEnvDataProvider } from './platformEnvData/biEnvDataProvider'
import { locationEnvDataProvider } from './platformEnvData/locationEnvDataProvider'
import { siteAssetsEnvDataProvider } from './platformEnvData/siteAssetsEnvDataProvider'
import { platformHandlersProvider } from './platformHandlers'
import { platformViewportAPI } from './viewportHandlers'
import { WarmupDataEnricherSymbol } from 'feature-warmup-data'
import { platformUrlManager } from './platformUrlManager'

export function createLoaders(platformInitializer: FactoryWithDependencies<PlatformInitializer>): { site: ContainerModuleLoader; page: ContainerModuleLoader } {
	return {
		page: (bind) => {
			bind(WixCodeSdkHandlersProviderSym, UrlChangeHandlerForPage).to(platformUrlManager)
		},
		site: (bind) => {
			bind(PlatformSymbol, LifeCycle.AppWillLoadPageHandler).to(Platform)
			bind(PlatformStorageSymbol, WixCodeSdkHandlersProviderSym, PlatformEvnDataProviderSymbol).to(Storage)
			bind(WixCodeSdkHandlersProviderSym).to(platformHandlersProvider)
			bind(PlatformViewportAPISym, LifeCycle.AppWillLoadPageHandler).to(platformViewportAPI)
			bind(PlatformEvnDataProviderSymbol).to(locationEnvDataProvider)
			bind(PlatformEvnDataProviderSymbol).to(biEnvDataProvider)
			bind(PlatformEvnDataProviderSymbol).to(siteAssetsEnvDataProvider)
			Object.values(platformEnvDataProviders).forEach((envDataProvider) => {
				bind(PlatformEvnDataProviderSymbol).to(envDataProvider)
			})
			if (process.env.browser) {
				bind(PlatformInitializerSym, LifeCycle.AppWillRenderFirstPageHandler).to(platformInitializer)
				bind(PlatformWorkerPromiseSym).toConstantValue(require('./client/create-worker'))
			} else {
				bind(PlatformInitializerSym, WarmupDataEnricherSymbol).to(platformInitializer)
			}
		},
	}
}
