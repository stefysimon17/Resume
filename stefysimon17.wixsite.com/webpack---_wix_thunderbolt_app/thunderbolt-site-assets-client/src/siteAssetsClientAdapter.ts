import { SiteAssetsClient, siteAssetsClientBuilder, SiteAssetsRequest } from '@wix/site-assets-client'
import type {
	ProcessLevelSACFactoryParams,
	RequestLevelSACFactoryParams,
	SiteAssetsClientAdapter,
	TBSiteAssetsRequest,
} from './types'

import { getCommonParams, getUniqueParamsPerModule, toSiteAssetsRequest } from './adapters/siteAssetsRequestDomain'
import { toMetaSiteModel, toSitePagesModel } from './adapters/siteAssetsDomain'
import { toSiteAssetsHttpClient } from './adapters/fetch/siteAssetsHttpClient'
import { resolveFallbackStrategy } from './adapters/fallbackStrategy'
import { updateConfig } from './adapters/configResolvers'

export const createSiteAssetsClientAdapter = ({
	fetchFn,
	config,
	siteAssetsMetricsReporter,
	manifests,
	moduleFetcher,
	onFailureDump = () => {},
	timeout,
}: ProcessLevelSACFactoryParams) => ({
	dataFixersParams,
	requestUrl,
	siteScopeParams,
	beckyExperiments,
	fallbackStrategyOverride,
	staticHTMLComponentUrl,
	remoteWidgetStructureBuilderVersion,
	deviceInfo,
	qaMode,
	experiments,
}: RequestLevelSACFactoryParams): SiteAssetsClientAdapter => {
	const sitePagesModel = toSitePagesModel(dataFixersParams, siteScopeParams)
	const siteAssetsClient: SiteAssetsClient = siteAssetsClientBuilder(
		{
			httpClient: toSiteAssetsHttpClient(
				requestUrl,
				fetchFn,
				config.moduleTopology.environment.siteAssetsServerUrl
			),
			moduleFetcher,
			metricsReporter: siteAssetsMetricsReporter,
		},
		updateConfig(experiments, config),
		{
			sitePagesModel,
			metaSiteModel: toMetaSiteModel(dataFixersParams, siteScopeParams),
		}
	)

	return {
		executeTestModule(request: TBSiteAssetsRequest, siteAssetsTestModuleVersion?: string): void {
			if (!siteAssetsTestModuleVersion) {
				return
			}
			const { moduleParams, pageCompId, pageJsonFileName } = request
			const { contentType } = moduleParams

			const executeRequest = (version: string) => {
				if (!version) {
					return
				}
				const siteAssetsRequest: SiteAssetsRequest = {
					disableSiteAssetsCache: true,
					endpoint: {
						controller: 'pages',
						methodName: 'thunderbolt',
					},
					module: {
						name: 'site-assets-test-module',
						version,
						fetchType: 'module',
						params: {
							...getCommonParams(
								siteScopeParams,
								request,
								beckyExperiments,
								remoteWidgetStructureBuilderVersion
							),
							...getUniqueParamsPerModule({
								deviceInfo,
								staticHTMLComponentUrl,
								qaMode,
							})(moduleParams),
						},
					},
					contentType,
					fallbackStrategy: 'disable',
					pageJsonFileName: pageJsonFileName || sitePagesModel.pageJsonFileNames[pageCompId],
					timeout,
					customRequestSource: siteScopeParams.isInSeo ? 'seo' : undefined,
				}
				return siteAssetsClient.execute(siteAssetsRequest).catch(() => {})
			}
			siteAssetsTestModuleVersion.split(',').forEach(executeRequest)
		},
		// result() returns a (Promise of) string or json depending on the content-type of the module output
		execute(request: TBSiteAssetsRequest, fallbackStrategy: string): Promise<string | any> {
			const siteAssetsFallbackStrategy = resolveFallbackStrategy(
				fallbackStrategyOverride,
				request.moduleParams.resourceType,
				fallbackStrategy
			)
			return siteAssetsClient
				.execute(
					toSiteAssetsRequest(
						request,
						manifests.node.modulesToHashes,
						sitePagesModel.pageJsonFileNames,
						siteScopeParams,
						beckyExperiments,
						staticHTMLComponentUrl,
						remoteWidgetStructureBuilderVersion,
						deviceInfo,
						qaMode,
						timeout,
						siteAssetsFallbackStrategy
					)
				)
				.catch((e) => {
					const moduleName = request.moduleParams.moduleName
					const pageCompId = request.pageCompId
					onFailureDump({
						siteAssetsFailureMessage: e.message,
						moduleName,
						pageCompId,
						// add here as many data as you like
					})
					throw e
				})
				.then(({ result }) => result())
		},
		calcPublicModuleUrl(request: TBSiteAssetsRequest): string {
			return siteAssetsClient.getPublicUrl(
				toSiteAssetsRequest(
					request,
					manifests.node.modulesToHashes,
					sitePagesModel.pageJsonFileNames,
					siteScopeParams,
					beckyExperiments,
					staticHTMLComponentUrl,
					remoteWidgetStructureBuilderVersion,
					deviceInfo,
					qaMode
				)
			)
		},
		getInitConfig() {
			return config
		},
	}
}
