import { withDependencies, named, optional } from '@wix/thunderbolt-ioc'
import {
	HeadContentSymbol,
	IHeadContent,
	SiteFeatureConfigSymbol,
	HeadContentType,
	IMultilingual,
	MasterPageFeatureConfigSymbol,
	FeatureStateSymbol,
	Language,
	LoggerSymbol,
	ILogger,
} from '@wix/thunderbolt-symbols'
import { MultilingualSymbol } from 'feature-multilingual'
import type {
	SiteLevelSeoData,
	ISeoSiteApi,
	SeoSiteState,
	SeoMasterPageConfig,
	SeoFeatureState,
	SeoPageConfig,
} from './types'
import { name } from './symbols'
import { DEFAULT_STATUS_CODE } from './api'
import { TbDebugSymbol, ISeoDebugHandlers } from 'feature-debug'
import { IFeatureState } from 'thunderbolt-feature-state'

const initialFeatureState: SeoFeatureState = {
	isPageMounted: false,
	isAfterNavigation: false,
}

const shouldRenderDom = (featureState: IFeatureState<SeoFeatureState>): boolean => {
	const { isPageMounted, isAfterNavigation } = featureState.get() || initialFeatureState
	const isInSSR = !process.env.browser
	const isClientFallback = !isInSSR && window.clientSideRender
	const noTitleExistsOnClient = !isInSSR && !document?.title?.length && !!document?.body
	const isClientReady = !isInSSR && isPageMounted && isAfterNavigation
	return isClientReady || isClientFallback || noTitleExistsOnClient
}

export const SeoSite = withDependencies(
	[
		named(SiteFeatureConfigSymbol, name),
		named(MasterPageFeatureConfigSymbol, name),
		HeadContentSymbol,
		named(FeatureStateSymbol, name),
		LoggerSymbol,
		optional(MultilingualSymbol),
		optional(TbDebugSymbol),
	],
	(
		siteLevelSeoData: SiteLevelSeoData,
		masterPageConfig: SeoMasterPageConfig,
		headUtils: IHeadContent,
		featureState: IFeatureState<SeoFeatureState>,
		logger: ILogger,
		multilingualApi: IMultilingual | undefined,
		tbDebug: ISeoDebugHandlers | undefined
	): ISeoSiteApi => {
		const state: SeoSiteState = {
			pageId: undefined,
			pageLevelData: undefined,
			tpaSeoEndpointData: [],
			tpaOverrides: [],
			veloOverrides: [],
			veloItemPayload: undefined,
			seoStatusCode: DEFAULT_STATUS_CODE,
			redirectUrl: undefined,
			dynamicPageData: [],
			tpaOverridesListener: () => {},
			pageHref: siteLevelSeoData.context.defaultUrl,
			componentsItemPayload: [],
		} as SeoSiteState

		const logError = ({ error, data }: { error: any; data: any }) =>
			logger.captureError(error, { tags: { feature: 'seo-site' }, extra: data })

		if (multilingualApi) {
			siteLevelSeoData.context.currLangCode = multilingualApi.currentLanguage.languageCode
			siteLevelSeoData.context.seoLang = multilingualApi.currentLanguage.seoLang
			siteLevelSeoData.context.currLangIsOriginal = multilingualApi.isOriginalLanguage
			siteLevelSeoData.context.siteLanguages = getSiteLanguages(multilingualApi.siteLanguages)
		}

		const getPageData = (pageId = ''): Partial<SeoPageConfig> => {
			return {
				...(masterPageConfig[pageId] || {}),
				...(state.pageLevelData || {}),
				currentPageUrl: state.pageHref,
			}
		}

		function getSiteLanguages(siteLanguages: Array<Language>) {
			const primary = siteLanguages.find((lang) => lang.isPrimaryLanguage)
			if (primary) {
				const xDefault: Language = {
					...primary,
					isPrimaryLanguage: false,
					languageCode: 'x-default',
				}

				return [xDefault, ...siteLanguages]
			} else {
				return siteLanguages
			}
		}

		const getTagsPayload = () => ({
			siteLevelSeoData: {
				...siteLevelSeoData,
				context: { ...siteLevelSeoData.context, defaultUrl: state.pageHref },
			},
			pageLevelSeoData: getPageData(state.pageId),
			veloOverrides: state.veloOverrides,
			veloItemPayload: state.veloItemPayload,
			tpaSeoEndpointData: state.tpaSeoEndpointData,
			tpaOverrides: state.tpaOverrides,
			dynamicPageData: state.dynamicPageData,
			componentsItemPayload: state.componentsItemPayload,
		})

		const renderSEODom = async () => {
			if (shouldRenderDom(featureState)) {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				const tags = await api.getTags(getTagsPayload())
				const title = api.getTitle(tags)
				api.setWindowTitle(title)
				api.setSocialTagsToDOM(tags)
			}
		}

		const seoApi: ISeoSiteApi = {
			getSiteLevelSeoData: (): SiteLevelSeoData => siteLevelSeoData,
			getSeoStatusCode: (): number => state.seoStatusCode,
			getRedirectUrl: () => state.redirectUrl,
			setPageId: (pageId) => {
				state.pageId = pageId
			},
			setPageData: (pageLevelSeoData) => {
				state.pageLevelData = pageLevelSeoData
			},
			setPageHref: (href) => {
				if (href) {
					state.pageHref = href
				}
			},
			resetTpaAndVeloData: () => {
				state.tpaOverrides = []
				state.dynamicPageData = []
				state.veloOverrides = []
				state.veloItemPayload = undefined
				state.tpaOverridesListener(state.tpaOverrides)
			},
			setVeloTitle: async (title) => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				state.veloOverrides = api.setTitle(state.veloOverrides, title)
			},
			setVeloLinks: async (links) => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				state.veloOverrides = api.setLinks(state.veloOverrides, links)
			},
			setVeloMetaTags: async (metaTags) => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				state.veloOverrides = api.setMetaTags(state.veloOverrides, metaTags)
			},
			setVeloStructuredData: async (structuredData) => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				state.veloOverrides = api.setSchemas(state.veloOverrides, structuredData)
			},
			setVeloSeoStatusCode: (seoStatusCode) => {
				state.seoStatusCode = seoStatusCode
			},
			setRedirectUrl: (redirectUrl) => {
				state.redirectUrl = redirectUrl
			},
			setVeloSeoTags: async (payload) => {
				if (payload?.itemType && payload?.itemData) {
					const { isComponentItemType } = await import('./api/api' /* webpackChunkName: "seo-api" */)

					if (isComponentItemType(payload.itemType)) {
						state.componentsItemPayload.push(payload)
					} else {
						state.veloItemPayload = {
							asNewPage: false,
							seoData: {},
							...payload,
						}
					}
				}
			},
			resetVeloSeoTags: async () => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				state.veloItemPayload = api.getDefaultItemPayload()
				state.componentsItemPayload = []
			},
			renderSEO: async () => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				const tags = await api.getTags(getTagsPayload(), { logError })
				const staticMarkup = api.getStaticMarkup(tags, { logError }).concat(siteLevelSeoData.customHeadTags)
				headUtils.setHead(staticMarkup, HeadContentType.SEO)
				renderSEODom()
				return tags
			},
			renderSEODom,
			isInSEO: () => siteLevelSeoData.isInSEO,
			getPageTitle: async () => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				const tags = await api.getTags(getTagsPayload())
				const title = api.getTitle(tags)
				return title
			},
			setTPAOverrides: async (payload) => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				const { title, fullTitle, description } = payload
				if (fullTitle) {
					state.tpaOverrides = api.setTitle(state.tpaOverrides, fullTitle)
				} else if (title) {
					state.tpaOverrides = api.setTitle(state.tpaOverrides, title)
				}
				if (description) {
					state.tpaOverrides = api.setDescription(state.tpaOverrides, description)
				}
				state.tpaOverridesListener(state.tpaOverrides)
			},
			setTPAEndpointData: async (payload) => {
				const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
				state.tpaSeoEndpointData = await api.convertTPAEndpointModel(payload)
			},
			resetTPAEndpointData: () => {
				state.tpaSeoEndpointData = []
			},
			setDynamicRouteOverrides: async (payload) => {
				if (payload) {
					const { mediaItemUtils } = await import(
						'@wix/santa-platform-utils' /* webpackChunkName: "santa-platform-utils" */
					)
					const api = await import('./api/api' /* webpackChunkName: "seo-api" */)
					const { veloOverrides = state.veloOverrides, dynamicPageData = state.dynamicPageData } =
						api.extractDynamicRouteData(payload, mediaItemUtils, state.veloOverrides) || {}
					state.veloOverrides = veloOverrides
					state.dynamicPageData = dynamicPageData
				}
			},
			onTPAOverridesChanged: (cb) => (state.tpaOverridesListener = cb),
		}

		if (tbDebug) {
			const omit = (prop: any, { [prop]: _, ...rest }) => rest
			const getSeoState = () => omit('tpaOverridesListener', state)
			return tbDebug.seoDebugProxy(seoApi, getSeoState) as ISeoSiteApi
		}
		return seoApi
	}
)
