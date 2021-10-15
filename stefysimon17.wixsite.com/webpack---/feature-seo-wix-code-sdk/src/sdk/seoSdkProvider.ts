import { withDependencies } from '@wix/thunderbolt-ioc'
import { SdkHandlersProvider, PlatformEnvDataProvider } from '@wix/thunderbolt-symbols'
import { SeoWixCodeSdkHandlers } from '../types'
import { SeoSiteSymbol, ISeoSiteApi } from 'feature-seo'

const SeoPlatformEnvDataProvider = (seoApi: ISeoSiteApi): PlatformEnvDataProvider => {
	const siteLevelSeoData = seoApi.getSiteLevelSeoData()
	return {
		platformEnvData: {
			seo: {
				...siteLevelSeoData,
			},
		},
	}
}

const SeoWixCodeSdkHandlersFactory = (seoApi: ISeoSiteApi): SdkHandlersProvider<SeoWixCodeSdkHandlers> => {
	return {
		getSdkHandlers() {
			return {
				async setTitle(title) {
					await seoApi.setVeloTitle(title)
					seoApi.renderSEO()
				},
				async setLinks(links) {
					await seoApi.setVeloLinks(links)
					seoApi.renderSEO()
				},
				async setMetaTags(metaTags) {
					await seoApi.setVeloMetaTags(metaTags)
					seoApi.renderSEO()
				},
				async setStructuredData(structuredData) {
					await seoApi.setVeloStructuredData(structuredData)
					seoApi.renderSEO()
				},
				async setSeoStatusCode(seoStatusCode) {
					await seoApi.setVeloSeoStatusCode(seoStatusCode)
				},
				async renderSEOTags(payload) {
					await seoApi.setVeloSeoTags(payload)
					seoApi.renderSEO()
				},
				async resetSEOTags() {
					await seoApi.resetVeloSeoTags()
					seoApi.renderSEO()
				},
				onTPAOverrideChanged(cb) {
					seoApi.onTPAOverridesChanged(cb)
				},
			}
		},
	}
}

export const seoPlatformEnvDataProvider = withDependencies([SeoSiteSymbol], SeoPlatformEnvDataProvider)
export const seoWixCodeSdkHandlersProvider = withDependencies([SeoSiteSymbol], SeoWixCodeSdkHandlersFactory)
