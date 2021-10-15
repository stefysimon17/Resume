import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	CurrentRouteInfoSymbol,
	IPageResourceFetcher,
	SiteAssetsClientSym,
	ViewerModel,
	ViewerModelSym,
} from '@wix/thunderbolt-symbols'
import { SiteAssetsClientAdapter } from 'thunderbolt-site-assets-client'
import { errorPagesIds } from '@wix/thunderbolt-commons'
import { ICurrentRouteInfo } from 'feature-router'

export const resourceFetcher: (
	viewerModel: ViewerModel,
	siteAssetsClient: SiteAssetsClientAdapter,
	currentRouteInfo: ICurrentRouteInfo
) => IPageResourceFetcher = (viewerModel, siteAssetsClient, currentRouteInfo) => ({
	fetchResource(pageCompId, resourceType) {
		const {
			siteAssets: { modulesParams, siteScopeParams },
			mode: { siteAssetsFallback },
		} = viewerModel

		const moduleParams = modulesParams[resourceType]
		const isErrorPage = !!errorPagesIds[pageCompId]

		const pageJsonFileNames = siteScopeParams.pageJsonFileNames
		const pageJsonFileName =
			pageJsonFileNames[pageCompId] || currentRouteInfo.getCurrentRouteInfo()?.pageJsonFileName

		const response = siteAssetsClient.execute(
			{
				moduleParams,
				pageCompId,
				...(pageJsonFileName ? { pageJsonFileName } : {}),
				...(isErrorPage
					? {
							pageCompId: isErrorPage ? 'masterPage' : pageCompId,
							errorPageId: pageCompId,
							pageJsonFileName: pageJsonFileNames.masterPage,
					  }
					: {}),
			},
			siteAssetsFallback
		)

		if (viewerModel.experiments['specs.thunderbolt.site_assets_test_module'] && resourceType === 'css') {
			const pages = viewerModel?.siteFeaturesConfigs?.router?.pages || {}
			const numberOfPages = Object.keys(pages).length
			if (siteAssetsClient.executeTestModule && numberOfPages < 100) {
				siteAssetsClient.executeTestModule(
					{
						moduleParams,
						pageCompId,
						...(pageJsonFileName ? { pageJsonFileName } : {}),
						...(isErrorPage
							? {
									pageCompId: isErrorPage ? 'masterPage' : pageCompId,
									errorPageId: pageCompId,
									pageJsonFileName: pageJsonFileNames.masterPage,
							  }
							: {}),
					},
					viewerModel.siteAssetsTestModuleVersion
				)
			}
		}

		return response
	},
	getResourceUrl(pageCompId, resourceType): string {
		const {
			siteAssets: { modulesParams, siteScopeParams },
		} = viewerModel

		const moduleParams = modulesParams[resourceType]
		const isErrorPage = !!errorPagesIds[pageCompId]

		const pageJsonFileNames = siteScopeParams.pageJsonFileNames
		const pageJsonFileName =
			pageJsonFileNames[pageCompId] || currentRouteInfo.getCurrentRouteInfo()?.pageJsonFileName

		return siteAssetsClient.calcPublicModuleUrl({
			moduleParams,
			pageCompId,
			...(pageJsonFileName ? { pageJsonFileName } : {}),
			...(isErrorPage
				? {
						pageCompId: isErrorPage ? 'masterPage' : pageCompId,
						errorPageId: pageCompId,
						pageJsonFileName: pageJsonFileNames.masterPage,
				  }
				: {}),
		})
	},
})

export const PageResourceFetcher = withDependencies<IPageResourceFetcher>(
	[ViewerModelSym, SiteAssetsClientSym, CurrentRouteInfoSymbol],
	resourceFetcher
)
