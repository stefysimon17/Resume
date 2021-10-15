import _ from 'lodash'
import { name } from '../symbols'
import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { TpaMasterPageConfig } from '../types'
import { MasterPageFeatureConfigSymbol, TpaHandlerProvider, SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { name as tpaCommonsName, TpaCommonsSiteConfig } from 'feature-tpa-commons'

export type GetSectionUrlResponse = any

export type MessageData = {
	sectionIdentifier: string
}

export const GetSectionUrlHandler = withDependencies(
	[named(SiteFeatureConfigSymbol, tpaCommonsName), named(MasterPageFeatureConfigSymbol, name)],
	({ externalBaseUrl }: TpaCommonsSiteConfig, { pagesData }: TpaMasterPageConfig): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				getSectionUrl(
					compId,
					{ sectionIdentifier }: MessageData,
					{ appClientSpecMapData }
				): GetSectionUrlResponse {
					const page = _.find(pagesData, { tpaPageId: sectionIdentifier })
					if (page?.id) {
						return { url: `${externalBaseUrl}/${page.pageUriSEO}` }
					} else {
						return {
							error: {
								message: `Page with app "${appClientSpecMapData?.appDefinitionName}" was not found.`,
							},
						}
					}
				},
			}
		},
	})
)
