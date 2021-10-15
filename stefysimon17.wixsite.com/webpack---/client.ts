import smoothscroll from 'smoothscroll-polyfill'
import { createLogger } from './features/logger/logger'
import { BIReporterImpl } from './features/bi/bi'
import { ThunderboltInitializerImpl } from './init/initThunderbolt'
import { fixViewport } from './lib/fixViewport'
import './assets/scss/viewer.global.scss' // Only import it so it will be written in manifest.json
import { internalFeaturesLoaders } from './featureLoaders'
import { featuresLoaders } from 'thunderbolt-features-loaders'
import { instance as biInstance } from './bi-module/instance'
import { IThunderboltClient } from './features/thunderbolt/IThunderbolt'
import { createFeaturesLoader } from '@wix/thunderbolt-features'
import { clientModuleFetcher, createClientSAC, toClientSACFactoryParams } from 'thunderbolt-site-assets-client'
import { BeatEventType } from '@wix/thunderbolt-symbols'
import { fedopsMetricsReporter, FetchApi, taskify } from '@wix/thunderbolt-commons'
import { createDomReadyPromise } from './features/thunderbolt/DomReady'
import { Hub } from '@sentry/types'
import { Environment } from './types/Environment'
import { Container } from '@wix/thunderbolt-ioc'
import { ClientRenderResponse } from 'feature-react-renderer'
import { IComponentsRegistrar } from '@wix/thunderbolt-components-loader'

taskify(() => smoothscroll.polyfill())

const { viewerModel, Sentry } = window
const fetchFn = window.fetch

const reportBI = biInstance.reportBI.bind(biInstance)
const sendBeat = biInstance.sendBeat.bind(biInstance)
const setDynamicSessionData = biInstance.setDynamicSessionData.bind(biInstance)
const reportPageNavigation = biInstance.reportPageNavigation.bind(biInstance)
const reportPageNavigationDone = biInstance.reportPageNavigationDone.bind(biInstance)

const getComponentLibraries = async (): Promise<Array<IComponentsRegistrar>> => {
	const { createComponentsRegistryCSR } = await import(
		'@wix/thunderbolt-components-registry/client' /* webpackChunkName: "thunderbolt-components-registry" */
	)
	const componentsRegistry = await createComponentsRegistryCSR()
	return [componentsRegistry.getLegacyComponentsRegistrarAPI()]
}

const runThunderbolt = async () => {
	await Promise.resolve(window.onBeforeStart)
	const { experiments, viewMode, requestUrl } = viewerModel

	const logger = await taskify(() =>
		createLogger({
			sentry: (Sentry as unknown) as Hub,
			wixBiSession: biInstance.wixBiSession,
			viewerModel,
			fetch: fetchFn,
		})
	)
	logger.phaseStarted('dom_ready')
	const biReporter = BIReporterImpl(
		reportBI,
		sendBeat,
		setDynamicSessionData,
		reportPageNavigation,
		reportPageNavigationDone
	)
	logger.phaseStarted('component_loader')
	const componentLibraries: Promise<Array<IComponentsRegistrar>> = getComponentLibraries()
	logger.phaseEnded('component_loader')

	const getWarmupData = () => JSON.parse(document.getElementById('wix-warmup-data')?.textContent || '{}')

	const { siteAssets } = viewerModel
	logger.phaseStarted('load_environment')
	const environment: Environment = {
		wixBiSession: biInstance.wixBiSession,
		viewerModel,
		biReporter,
		siteAssetsClient: createClientSAC(
			toClientSACFactoryParams({
				viewerModel,
				fetchFn,
				siteAssetsMetricsReporter: fedopsMetricsReporter(logger),
				moduleFetcher: clientModuleFetcher(
					fetchFn,
					siteAssets.clientTopology,
					{
						thunderbolt: siteAssets.manifests,
					},
					'web'
				),
				experiments,
			})
		),
		fetchApi: FetchApi(requestUrl, fetchFn),
		specificEnvFeaturesLoaders: createFeaturesLoader(
			{ ...internalFeaturesLoaders, ...featuresLoaders },
			{ experiments }
		),
		componentLibraries,
		logger,
		experiments,
		browserWindow: window,
		warmupData: createDomReadyPromise().then(getWarmupData),
	}

	const thunderboltInitializer = ThunderboltInitializerImpl(new Container())

	thunderboltInitializer.loadEnvironment(environment)
	logger.phaseEnded('load_environment')

	logger.phaseStarted('load_renderer')
	const rendererPromise = taskify(async () => {
		return thunderboltInitializer.getRenderer<ClientRenderResponse>()
	})

	const renderer = await taskify(async () => {
		try {
			await thunderboltInitializer.loadSiteFeatures()
		} catch (e) {
			logger.captureError(e, { tags: { phase: 'load_site_features' }, groupErrorsBy: 'values' })
		}
		return rendererPromise
	})
	logger.phaseEnded('load_renderer')

	logger.phaseStarted('tb_client')
	const thunderboltClient = await taskify(async () => {
		return (await thunderboltInitializer.getThunderboltInvoker<IThunderboltClient>())()
	})
	logger.phaseEnded('tb_client')

	const { firstPageId } = await taskify(async () => {
		try {
			logger.phaseStarted('client_render')
			await renderer.render()
			logger.phaseEnded('client_render')
		} catch (e) {
			logger.captureError(e, { tags: { phase: 'client_render' }, groupErrorsBy: 'values' })
		}
		return taskify(() => thunderboltClient.appDidMount())
	})

	if (viewMode === 'mobile') {
		await taskify(() => fixViewport())
	}

	biReporter.sendBeat(BeatEventType.PAGE_FINISH, 'page interactive', { pageId: firstPageId })
	logger.appLoaded()
}

runThunderbolt()
