import _ from 'lodash'
import { withDependencies, named, optional } from '@wix/thunderbolt-ioc'
import {
	TpaHandlerProvider,
	PageFeatureConfigSymbol,
	MasterPageFeatureConfigSymbol,
	SiteFeatureConfigSymbol,
} from '@wix/thunderbolt-symbols'
import { createLinkUtils } from '@wix/thunderbolt-commons'
import { INavigation, NavigationSymbol } from 'feature-navigation'
import { IRoutingLinkUtilsAPI, RoutingLinkUtilsAPISymbol } from 'feature-router'
import { IPopupsLinkUtilsAPI, PopupsLinkUtilsAPISymbol } from 'feature-popups'
import { CustomUrlMapperSymbol, ICustomUrlMapper, UrlMappingsKeys } from 'feature-custom-url-mapper'
import { BuildCustomizedUrlOptions } from '@wix/url-mapper-utils'
import { DynamicPageLinkData } from '@wix/thunderbolt-becky-types'
import { PageTransitionsSymbol, IPageTransition } from 'feature-page-transitions'
import { ITpaSection, name as tpaCommonsName, TpaSectionSymbol, TpaCommonsSiteConfig } from 'feature-tpa-commons'
import { TpaPageConfig, TpaMasterPageConfig } from '../types'
import { name } from '../symbols'
import { TPA_HANDLER_EMPTY_RESPONSE } from '../utils/constants'
import { IMultilingualLinkUtilsAPI, MultilingualLinkUtilsAPISymbol } from 'feature-multilingual'

export type MessageData = {
	sectionIdentifier?: {
		sectionId: string
		appDefinitionId?: string
		queryParams?: {
			[paramName: string]: string
		}
		state?: string
		noTransition?: boolean
		shouldRefreshIframe?: boolean
		customizeTarget?: {
			customUrlData?: {
				key: UrlMappingsKeys
				variables: Record<string, string>
				options: BuildCustomizedUrlOptions
			}
		}
	}
	state?: string
}

export const NavigateToSectionHandler = withDependencies(
	[
		named(SiteFeatureConfigSymbol, tpaCommonsName),
		named(PageFeatureConfigSymbol, name),
		named(MasterPageFeatureConfigSymbol, name),
		NavigationSymbol,
		RoutingLinkUtilsAPISymbol,
		TpaSectionSymbol,
		optional(PopupsLinkUtilsAPISymbol),
		optional(MultilingualLinkUtilsAPISymbol),
		optional(PageTransitionsSymbol),
		optional(CustomUrlMapperSymbol),
	],
	(
		tpaSiteConfig: TpaCommonsSiteConfig,
		tpaPageConfig: TpaPageConfig,
		tpaMasterPageConfig: TpaMasterPageConfig,
		navigation: INavigation,
		routingLinkUtilsAPI: IRoutingLinkUtilsAPI,
		{ getTpaSectionByAppDefinitionId }: ITpaSection,
		popupsLinkUtilsAPI: IPopupsLinkUtilsAPI,
		multilingualLinkUtilsAPI: IMultilingualLinkUtilsAPI,
		pageTransition: IPageTransition,
		customUrlMapper?: ICustomUrlMapper
	): TpaHandlerProvider => {
		return {
			getTpaHandlers() {
				return {
					// https://dev.wix.com/api/iframe-sdk/sdk/wix.utils#sdk_wix.utils_navigatetosection
					async navigateToSectionPage(
						compId: string,
						msgData: MessageData,
						{ originCompId, appDefinitionId: callerAppDefinitionId }
					) {
						const {
							metaSiteId,
							userFileDomainUrl,
							routersConfig,
							appsClientSpecMapData,
							appsClientSpecMapByApplicationId,
							isMobileView,
						} = tpaSiteConfig

						const pagesDataEntries = Object.entries(tpaMasterPageConfig.pagesData)
						const appIdToSectionIdToPageId = pagesDataEntries.reduce(
							(acc, [pageId, pageData]) => {
								if (!acc[pageData.tpaApplicationId]) {
									acc[pageData.tpaApplicationId] = {}
								}

								acc[pageData.tpaApplicationId][pageData.tpaPageId] = pageId

								return acc
							},
							{} as {
								[appId: string]: {
									[sectionId: string]: string
								}
							}
						)

						const appIdToAppPagesIds = _(tpaMasterPageConfig.pagesData)
							.groupBy('tpaApplicationId')
							.mapValues((pages) => pages.map((page) => page.id))
							.value()

						const resolveCustomUrl = async (_msgData: MessageData): Promise<string | void> => {
							const urlMappings = customUrlMapper?.urlMappings

							if (urlMappings) {
								const { buildCustomizedUrl } = await import(
									'@wix/url-mapper-utils' /* webpackChunkName: "url-mapper-utils" */
								)
								const { key, variables, options } =
									_msgData?.sectionIdentifier?.customizeTarget?.customUrlData || {}
								if (key && variables) {
									return buildCustomizedUrl(urlMappings, key as UrlMappingsKeys, variables, options)
								}
							}
						}

						const linkUtils = createLinkUtils({
							routingInfo: routingLinkUtilsAPI.getLinkUtilsRoutingInfo(),
							metaSiteId,
							userFileDomainUrl,
							routersConfig,
							popupPages: popupsLinkUtilsAPI?.getPopupPages(),
							multilingualInfo: multilingualLinkUtilsAPI?.getMultilingualInfo(),
							isMobileView,
						})

						const {
							sectionIdentifier: {
								sectionId,
								noTransition = false,
								appDefinitionId,
								queryParams = {},
								state: stateFromSectionIdentifier,
							} = {},
							state: stateFromRoot,
						} = msgData

						const state = stateFromRoot || stateFromSectionIdentifier

						const getAppIdCompId = (id: string) => {
							return tpaPageConfig.widgets[id].applicationId
						}

						const getAppIdFromAppDefId = (appDefId: string) => {
							return appsClientSpecMapData[appDefId].applicationId
						}

						const appId = appDefinitionId
							? getAppIdFromAppDefId(appDefinitionId)
							: getAppIdCompId(originCompId)
						const appData = appsClientSpecMapByApplicationId[appId]

						if (!appData) {
							if (!appDefinitionId) {
								return {
									error: {
										message: `Application with appDefinitionId "${appDefinitionId}" was not found on the site.`,
									},
								}
							}

							return { error: { message: 'Component was not found.' } }
						}

						const nextAppPages = appIdToAppPagesIds[appId]
						if (!nextAppPages || nextAppPages.length === 0) {
							return {
								error: {
									message: `Page with app "${appData.appDefinitionName}" was not found.`,
								},
							}
						}

						const sectionPageId = sectionId ? appIdToSectionIdToPageId[appId][sectionId] : null

						if (sectionId && !sectionPageId) {
							return {
								error: {
									message: `App page with sectionId "${sectionId}" was not found.`,
								},
							}
						}
						const nextPageId = sectionPageId || nextAppPages[0]

						const linkData: DynamicPageLinkData = {
							type: 'DynamicPageLink',
							routerId: nextPageId,
							innerRoute: state,
							isTpaRoute: true,
						}

						const linkUrl = (await resolveCustomUrl(msgData)) || linkUtils.getLinkUrlFromDataItem(linkData)

						if (linkUtils.isDynamicPage(linkUrl)) {
							return {
								error: {
									message:
										"Can't navigate to a dynamic page. Please use the platform app API instead.",
								},
							}
						}

						const queryParamsUrl = _.isEmpty(queryParams)
							? ''
							: `?appSectionParams=${encodeURIComponent(JSON.stringify(queryParams))}`
						const url = `${linkUrl}${queryParamsUrl}`

						const linkProps = linkUtils.getLinkProps(url)

						if (noTransition && pageTransition) {
							pageTransition.disableNextTransition()
						}

						const didNavigate = await navigation.navigateTo(linkProps)
						if (!didNavigate) {
							console.warn(
								'You have invoked the navigateToSectionPage() API but you are already on the section page. Please use the pushState() API instead.'
							)

							if (msgData.sectionIdentifier?.shouldRefreshIframe === false) {
								// explicit false
								return TPA_HANDLER_EMPTY_RESPONSE
							}
							// the application's section might be on a different container, this api grab an instance of it wherever it is
							const tpaSection = getTpaSectionByAppDefinitionId(appDefinitionId || callerAppDefinitionId)
							if (tpaSection) {
								tpaSection.rebuildSrc()
							}
						}

						return TPA_HANDLER_EMPTY_RESPONSE
					},
				}
			},
		}
	}
)
