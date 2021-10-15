import _ from 'lodash'
import type { PlatformEnvData, PlatformUtils, WixCodeApi, FeatureName, PlatformLogger, ClientSpecMapAPI, ModelsAPI } from '@wix/thunderbolt-symbols'
import type { WixCodeViewerAppUtils } from './wixCodeViewerAppUtils'
import type { BootstrapData } from '../types'
import { wixCodeSdkFactories } from '../wixCodeSdks'

export type WixCodeApiFactory = {
	initWixCodeApiForApplication: (appDefinitionId: string) => Promise<WixCodeApi>
}

export function createWixCodeApiFactory({
	bootstrapData,
	wixCodeViewerAppUtils,
	modelsApi,
	clientSpecMapApi,
	platformUtils,
	createSdkHandlers,
	platformEnvData,
	logger,
}: {
	bootstrapData: BootstrapData
	wixCodeViewerAppUtils: WixCodeViewerAppUtils
	modelsApi: ModelsAPI
	clientSpecMapApi: ClientSpecMapAPI
	platformUtils: PlatformUtils
	createSdkHandlers: (pageId: string) => any
	platformEnvData: PlatformEnvData
	logger: PlatformLogger
}): WixCodeApiFactory {
	type SdkFactory = (appDefinitionId: string) => { [namespace: string]: any }
	const internalNamespaces = {
		// TODO: move this somewhere else
		events: {
			setStaticEventHandlers: wixCodeViewerAppUtils.setStaticEventHandlers,
		},
	}

	const createWixCodeApiFactories = () =>
		Promise.all(
			_.map(wixCodeSdkFactories, async (loader, name: FeatureName) => {
				const featurePageConfig = modelsApi.getFeaturePageConfig(name)
				const featureSiteConfig = bootstrapData.sdkFactoriesSiteFeatureConfigs[name] || {}
				const sdkFactory = await loader({ modelsApi, clientSpecMapApi, platformEnvData })

				return (appDefinitionId: string) =>
					sdkFactory({
						featureConfig: { ...featureSiteConfig, ...featurePageConfig },
						handlers: createSdkHandlers(bootstrapData.currentPageId),
						platformUtils,
						platformEnvData,
						appDefinitionId,
					})
			})
		)

	// @ts-ignore
	const wixCodeSdksPromise: Promise<Array<SdkFactory>> = logger.runAsyncAndReport('createWixCodeApi', createWixCodeApiFactories)

	return {
		initWixCodeApiForApplication: async (appDefinitionId: string) => {
			const factories = await wixCodeSdksPromise
			const wixCodeSdkArray = await Promise.all(_.map(factories, (factory) => factory(appDefinitionId))) // members API (users) returns a promise.
			return Object.assign({}, internalNamespaces, ...wixCodeSdkArray)
		},
	}
}
