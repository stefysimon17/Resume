import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import type { IRoutingConfig, IRoutingMiddleware } from './types'
import { name } from './symbols'
import { errorPagesIds } from '@wix/thunderbolt-commons'

const pageJsonFileNameMiddleware = (routingConfig: IRoutingConfig): IRoutingMiddleware => ({
	handle: async (routeInfo) => {
		if (!routeInfo.pageId) {
			throw new Error(`did not find the pageId for the requested url ${routeInfo.parsedUrl?.pathname}`)
		}

		const isErrorPage = errorPagesIds[routeInfo.pageId!]
		const pageJsonFileName = isErrorPage ? routeInfo.pageId : routingConfig.pages[routeInfo.pageId!]

		return {
			...routeInfo,
			pageJsonFileName,
		}
	},
})

export const PageJsonFileNameMiddleware = withDependencies(
	[named(SiteFeatureConfigSymbol, name)],
	pageJsonFileNameMiddleware
)
