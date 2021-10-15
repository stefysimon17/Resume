import { named, optional, withDependencies } from '@wix/thunderbolt-ioc'
import { ComponentWillMount, ViewerComponent } from 'feature-components'
import { TPA_COMPONENTS } from './constants'
import { PageFeatureConfigSymbol, SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { IFrameStartedLoadingReporterSymbol, name, TpaComponentApiSymbol } from './symbols'
import type { IIFrameStartedLoadingReporter, ITpaComponentApi, TpaPageConfig } from './types'
import {
	ITpaSection,
	MasterPageTpaPropsCache,
	MasterPageTpaPropsCacheSymbol,
	TpaCommonsSiteConfig,
	TpaSectionRegistry,
	TpaSectionSymbol,
	name as tpaCommons,
	TpaDataCapsuleSymbol,
	ITpaDataCapsule,
} from 'feature-tpa-commons'
import _ from 'lodash'
import * as ResponsiveChatUtils from './utils/responsiveChatUtils'

export const TpaComponentWillMount = withDependencies(
	[
		named(SiteFeatureConfigSymbol, tpaCommons),
		named(PageFeatureConfigSymbol, name),
		TpaComponentApiSymbol,
		TpaSectionSymbol,
		MasterPageTpaPropsCacheSymbol,
		optional(IFrameStartedLoadingReporterSymbol),
		optional(TpaDataCapsuleSymbol),
	],
	(
		{ widgetsClientSpecMapData }: TpaCommonsSiteConfig,
		tpaPageConfig: TpaPageConfig,
		tpaComponentApi: ITpaComponentApi,
		{ registerTpaSection, unregisterTpaSection }: ITpaSection,
		propsCache: MasterPageTpaPropsCache,
		iframeStartedLoadingReporter?: IIFrameStartedLoadingReporter,
		dataCapsule?: ITpaDataCapsule
	): ComponentWillMount<ViewerComponent> => {
		return {
			componentTypes: TPA_COMPONENTS,
			componentWillMount(comp) {
				const { widgets, tpaInnerRouteConfig, pageId } = tpaPageConfig
				const tpaCompData = widgets[comp.id]
				const { widgetId, isSection, appDefinitionId, templateId } = tpaCompData
				if (!widgetsClientSpecMapData[widgetId]) {
					// widget not in CSM, ignore it
					return
				}
				if (dataCapsule) {
					dataCapsule.registerToDataCapsule(templateId || comp.id, appDefinitionId)
				}

				const buildSrc = () =>
					tpaComponentApi.buildSrc({
						compId: comp.id,
						tpaCompData,
						pageId,
						tpaInnerRouteConfig,
					})

				if (isSection) {
					// provide cross containers api for tpa sections
					const entry: TpaSectionRegistry = {
						appDefinitionId,
						rebuildSrc: () => {
							comp.updateProps({
								src: buildSrc(),
							})
						},
					}
					registerTpaSection(comp.id, entry)
				}

				const reportIframeStartedLoading = _.once(() => {
					if (iframeStartedLoadingReporter) {
						iframeStartedLoadingReporter.reportIframeStartedLoading(comp.id)
					}
				})
				const defaultProps = tpaComponentApi.getDefaultProps(widgetId, reportIframeStartedLoading)

				// Get cached props by template/uniqueId depending on if the comp is a responsive chat
				const templateOrUniqueId = ResponsiveChatUtils.getTemplateOrUniqueId(comp.id, tpaCompData)
				const cachedProps = propsCache ? propsCache.getCachedProps(templateOrUniqueId) : {}

				comp.updateProps({
					...defaultProps,
					src: buildSrc(),
					...(cachedProps as any),
				})

				return () => {
					if (propsCache) {
						if (pageId === 'masterPage') {
							propsCache.cacheProps(comp.id)
						} else if (ResponsiveChatUtils.isResponsiveChat(tpaCompData)) {
							// For chat to persist between navigations when isResponsive is true - we are caching its props
							// Even if its not in the master page

							// Cache the already given props, by the viewer id, and save them under the template
							propsCache.cacheProps(templateOrUniqueId, comp.getProps())
						}
					}

					unregisterTpaSection(comp.id)
					if (dataCapsule) {
						dataCapsule.unregister(templateId || comp.id)
					}
				}
			},
		}
	}
)
