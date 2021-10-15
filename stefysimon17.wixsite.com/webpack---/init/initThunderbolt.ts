import { IThunderbolt } from '../features/thunderbolt/IThunderbolt'
import { Thunderbolt } from '../features/thunderbolt/symbols'
import { createEnvLoader } from '../features/env'
import { IocContainer } from '@wix/thunderbolt-ioc'
import { Environment } from '../types/Environment'
import {
	BIReporter,
	DynamicSessionModel,
	FeatureName,
	IFetchApi,
	ILogger,
	IPageAssetsLoader,
	IRenderer,
	MasterPageFeatureConfigSymbol,
	PageAssetsLoaderSymbol,
	RendererSymbol,
} from '@wix/thunderbolt-symbols'
import { taskify } from '@wix/thunderbolt-commons'
import { RendererProps } from 'feature-react-renderer'

type DeferredValue<T> = Promise<() => Promise<T>>

export interface ThunderboltInitializer {
	loadEnvironment(environment: Environment): void
	getRenderer<T>(): Promise<IRenderer<RendererProps, T>>
	loadSiteFeatures(): Promise<void>
	getThunderboltInvoker<T extends IThunderbolt>(): DeferredValue<T>
}

const RENDERER_FEATURES: Set<FeatureName> = new Set([
	'renderer',
	'ooi',
	'componentsLoader',
	'stores',
	'translations',
	'businessLogger',
	'assetsLoader',
	'sessionManager',
	'consentPolicy',
	'commonConfig',
	'componentsReact',
	'router',
	'navigationManager',
	'warmupData',
])

const loadMasterPageFeaturesConfigs = async (container: IocContainer) => {
	// This adds the master page structure and props to the fetchCache
	const assetsLoader = container.get<IPageAssetsLoader>(PageAssetsLoaderSymbol)
	const siteFeaturesConfigs = await assetsLoader.load('masterPage').siteFeaturesConfigs

	Object.entries(siteFeaturesConfigs).forEach(([featureName, featureConfig]) => {
		container.bind(MasterPageFeatureConfigSymbol).toConstantValue(featureConfig).whenTargetNamed(featureName)
	})
}

const loadDynamicModel = async ({
	biReporter,
	logger,
	fetchApi,
}: {
	biReporter: BIReporter
	logger: ILogger
	fetchApi: IFetchApi
}) => {
	const dynamicModelRaw = await window.fetchDynamicModel
	const applyModelData = ({ visitorId, siteMemberId }: DynamicSessionModel) => {
		biReporter.setDynamicSessionData({ visitorId, siteMemberId })
	}
	if (typeof dynamicModelRaw === 'object') {
		applyModelData(dynamicModelRaw)
	} else {
		logger.captureError(new Error(`failed fetching dynamicModel`), {
			tags: { fetchFail: 'dynamicModel' },
			extra: { errorMessage: dynamicModelRaw, attempt: 1 },
		})
		//  retry fetch floating promise by design!
		window.fetchDynamicModel = fetchApi
			.envFetch(window.viewerModel.dynamicModelUrl, { credentials: 'same-origin' })
			.then((res) => res.json())
			.then((model) => {
				applyModelData(model)
				return model
			})
			.catch((e) =>
				logger.captureError(e, {
					tags: { fetchFail: 'dynamicModel' },
					extra: { errorMessage: dynamicModelRaw, attempt: 1 },
				})
			)
	}
}

export const ThunderboltInitializerImpl: (container: IocContainer) => ThunderboltInitializer = (
	container: IocContainer
) => {
	let environment: Environment | null = null

	return {
		getRenderer: async <T>() => {
			const { specificEnvFeaturesLoaders, biReporter, logger, viewerModel, fetchApi } = environment!
			try {
				await taskify(() =>
					specificEnvFeaturesLoaders.loadSiteFeatures(
						container,
						viewerModel.siteFeatures.filter((x) => RENDERER_FEATURES.has(x))
					)
				)
				await taskify(() => loadMasterPageFeaturesConfigs(container))

				if (process.env.browser) {
					await taskify(() => loadDynamicModel({ biReporter, logger, fetchApi }))
				}
			} catch (e) {
				logger.captureError(e, { tags: { phase: 'get_renderer' }, groupErrorsBy: 'values' })
			}
			return container.get<IRenderer<RendererProps, T>>(RendererSymbol)
		},
		loadEnvironment: (env: Environment) => {
			environment = env
			container.load(createEnvLoader(environment))
		},
		loadSiteFeatures: async () => {
			const { viewerModel, specificEnvFeaturesLoaders } = environment!
			await taskify(() =>
				specificEnvFeaturesLoaders.loadSiteFeatures(
					container,
					viewerModel.siteFeatures.filter((x) => !RENDERER_FEATURES.has(x))
				)
			)
		},
		getThunderboltInvoker: async <T extends IThunderbolt>(): Promise<() => Promise<T>> => {
			return async () => {
				const thunderbolt = await taskify(() => container.get<T>(Thunderbolt))

				await taskify(() => thunderbolt.ready())

				return thunderbolt
			}
		},
	}
}
