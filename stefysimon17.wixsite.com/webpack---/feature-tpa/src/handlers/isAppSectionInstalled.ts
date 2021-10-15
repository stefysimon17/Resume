import _ from 'lodash'
import { name } from '../symbols'
import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { TpaPageConfig, TpaMasterPageConfig } from '../types'
import {
	PageFeatureConfigSymbol,
	MasterPageFeatureConfigSymbol,
	TpaHandlerProvider,
	SiteFeatureConfigSymbol,
} from '@wix/thunderbolt-symbols'
import { name as tpaCommonsName, TpaCommonsSiteConfig } from 'feature-tpa-commons'

export type MessageData = { appDefinitionId?: string; sectionId: string }

export const IsAppSectionInstalledHandler = withDependencies(
	[
		named(PageFeatureConfigSymbol, name),
		named(MasterPageFeatureConfigSymbol, name),
		named(SiteFeatureConfigSymbol, tpaCommonsName),
	],
	(
		{ widgets }: TpaPageConfig,
		{ pagesData }: TpaMasterPageConfig,
		{ widgetsClientSpecMapData }: TpaCommonsSiteConfig
	): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				isAppSectionInstalled(compId, { sectionId, appDefinitionId }: MessageData, { originCompId }): boolean {
					let applicationId: number | string = widgets[originCompId]?.applicationId
					if (appDefinitionId) {
						const app = _.find(widgetsClientSpecMapData, { appDefinitionId })
						applicationId = app?.applicationId || applicationId
					}
					const appPages = _.filter(pagesData, { tpaApplicationId: Number(applicationId) })
					return _.some(appPages, {
						tpaPageId: sectionId,
					})
				},
			}
		},
	})
)
