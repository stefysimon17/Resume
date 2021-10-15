import { FallbackStrategy, SiteAssetsRequest, SitePagesModel } from '@wix/site-assets-client'
import type { TBSiteAssetsRequest } from '../types'
import { stringifyExperiments } from '../utils'
import {
	CssSiteAssetsParams,
	Experiments,
	FeaturesSiteAssetsParams,
	ModulesToHashes,
	PlatformSiteAssetsParams,
	SiteAssetsResourceType,
	SiteMapSiteAssetsParams,
	SiteScopeParams,
	ViewerModel,
} from '@wix/thunderbolt-symbols'

type OneOfSiteAssetsParams =
	| CssSiteAssetsParams
	| PlatformSiteAssetsParams
	| FeaturesSiteAssetsParams
	| SiteMapSiteAssetsParams

type SiteAssetsParamsMap<U> = { [K in SiteAssetsResourceType]: U extends { resourceType: K } ? U : never }
type SiteAssetsParamsTypeMap = SiteAssetsParamsMap<OneOfSiteAssetsParams>
type Pattern<T> = { [K in keyof SiteAssetsParamsTypeMap]: (params: SiteAssetsParamsTypeMap[K]) => T }
function matcher<T>(pattern: Pattern<T>): (params: OneOfSiteAssetsParams) => T {
	// https://github.com/Microsoft/TypeScript/issues/14107
	return (params) => pattern[params.resourceType](params as any)
}

export const getUniqueParamsPerModule = ({
	deviceInfo,
	staticHTMLComponentUrl,
	qaMode,
}: {
	deviceInfo: ViewerModel['deviceInfo']
	staticHTMLComponentUrl: string
	qaMode?: ViewerModel['mode']['qa']
}) => {
	return matcher<Record<string, string>>({
		css: ({ stylableMetadataURLs, ooiVersions }) => {
			return {
				stylableMetadataURLs: JSON.stringify(stylableMetadataURLs ? stylableMetadataURLs : []),
				deviceType: deviceInfo.deviceClass,
				ooiVersions: ooiVersions || '',
			}
		},
		features: ({ languageResolutionMethod, isMultilingualEnabled, externalBaseUrl, useSandboxInHTMLComp }) => {
			return {
				languageResolutionMethod,
				isMultilingualEnabled: isMultilingualEnabled ? `${isMultilingualEnabled}` : 'false',
				useSandboxInHTMLComp: `${useSandboxInHTMLComp}`,
				externalBaseUrl,
				deviceType: deviceInfo.deviceClass,
				staticHTMLComponentUrl,
				...(qaMode && { qaMode: 'true' }),
			}
		},
		platform: ({ externalBaseUrl }) => {
			return {
				externalBaseUrl,
			}
		},
		siteMap: () => ({}),
	})
}

export const getCommonParams = (
	{
		freemiumBanner,
		coBrandingBanner,
		mobileActionsMenu,
		viewMode,
		isWixSite,
		hasTPAWorkerOnSite,
		isResponsive,
		wixCodePageIds,
		isPremiumDomain,
		migratingToOoiWidgetIds,
		registryLibrariesTopology,
		language,
		originalLanguage,
		isInSeo,
		appDefinitionIdToSiteRevision,
	}: SiteScopeParams,
	{ errorPageId, pageCompId }: TBSiteAssetsRequest,
	beckyExperiments: Experiments,
	remoteWidgetStructureBuilderVersion: string
) => {
	const isWixCodeOnPage = () =>
		`${
			// on responsive sites we do not fetch master page platform becky,
			// so we check for master page code in the single page request
			isResponsive
				? wixCodePageIds.includes('masterPage') || wixCodePageIds.includes(pageCompId)
				: wixCodePageIds.includes(pageCompId)
		}`

	const params = {
		freemiumBanner: freemiumBanner ? `${freemiumBanner}` : undefined,
		coBrandingBanner: coBrandingBanner ? `${coBrandingBanner}` : undefined,
		mobileActionsMenu: mobileActionsMenu ? `${mobileActionsMenu}` : undefined,
		isPremiumDomain: isPremiumDomain ? `${isPremiumDomain}` : undefined,
		isWixCodeOnPage: isWixCodeOnPage(),
		isWixCodeOnSite: `${wixCodePageIds.length > 0}`,
		hasTPAWorkerOnSite: `${hasTPAWorkerOnSite}`,
		viewMode: viewMode || undefined,
		isWixSite: isWixSite ? `${isWixSite}` : undefined,
		errorPageId: errorPageId || undefined,
		isResponsive: isResponsive ? `${isResponsive}` : undefined,
		beckyExperiments: stringifyExperiments(beckyExperiments) || undefined,
		remoteWidgetStructureBuilderVersion,
		migratingToOoiWidgetIds,
		registryLibrariesTopology:
			registryLibrariesTopology && registryLibrariesTopology.length
				? JSON.stringify(registryLibrariesTopology)
				: undefined,
		language,
		originalLanguage,
		isInSeo: isInSeo ? `${isInSeo}` : 'false',
		appDefinitionIdToSiteRevision: Object.keys(appDefinitionIdToSiteRevision).length
			? JSON.stringify(appDefinitionIdToSiteRevision)
			: undefined,
	}

	return Object.entries(params).reduce(
		(returnValue, [key, value]) => (value ? { ...returnValue, [key]: value } : returnValue),
		{}
	)
}

export function toSiteAssetsRequest(
	request: TBSiteAssetsRequest,
	modulesToHashes: ModulesToHashes,
	pageJsonFileNames: SitePagesModel['pageJsonFileNames'],
	siteScopeParams: SiteScopeParams,
	beckyExperiments: Experiments,
	staticHTMLComponentUrl: string,
	remoteWidgetStructureBuilderVersion: string,
	deviceInfo: ViewerModel['deviceInfo'],
	qaMode?: boolean,
	timeout?: number,
	fallbackStrategy?: FallbackStrategy
) {
	const { moduleParams, pageCompId, pageJsonFileName } = request
	const { contentType, moduleName } = moduleParams

	const siteAssetsRequest: SiteAssetsRequest = {
		endpoint: {
			controller: 'pages',
			methodName: 'thunderbolt',
		},
		module: {
			name: moduleName,
			version: modulesToHashes[moduleName],
			fetchType: 'file',
			params: {
				...getCommonParams(siteScopeParams, request, beckyExperiments, remoteWidgetStructureBuilderVersion),
				...getUniqueParamsPerModule({
					deviceInfo,
					staticHTMLComponentUrl,
					qaMode,
				})(moduleParams),
			},
		},
		contentType,
		fallbackStrategy: fallbackStrategy || 'disable',
		pageJsonFileName: pageJsonFileName || pageJsonFileNames[pageCompId],
		...(siteScopeParams.disableSiteAssetsCache
			? { disableSiteAssetsCache: siteScopeParams.disableSiteAssetsCache }
			: {}),
		timeout,
		customRequestSource: siteScopeParams.isInSeo ? 'seo' : undefined,
	}

	return siteAssetsRequest
}
