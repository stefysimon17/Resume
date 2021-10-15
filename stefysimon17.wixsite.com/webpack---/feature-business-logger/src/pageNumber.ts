import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { FeatureStateSymbol, IAppWillLoadPageHandler, ISamePageUrlChangeListener } from '@wix/thunderbolt-symbols'
import { IFeatureState } from 'thunderbolt-feature-state'
import { BsiManagerSymbol, name } from './symbols'
import type { IBsiManager, IPageNumber, PageNumberState } from './types'

const DEFAULT_PAGE_NUMBER = 0

const pageNumberHandlerFactory = (
	featureState: IFeatureState<PageNumberState>,
	bsiManager: IBsiManager
): IAppWillLoadPageHandler & IPageNumber & ISamePageUrlChangeListener => {
	const updatePageNumberAndReport = () => {
		const currentPageNumber = featureState.get()?.pageNumber || DEFAULT_PAGE_NUMBER
		const nextPageNumber = currentPageNumber + 1
		featureState.update(() => ({
			pageNumber: nextPageNumber,
		}))
		if (process.env.browser) {
			bsiManager.reportActivity()
		}
	}
	return {
		appWillLoadPage: () => {
			updatePageNumberAndReport()
		},
		getPageNumber: () => featureState.get()?.pageNumber || 1,
		// same page url change
		onUrlChange: () => {
			updatePageNumberAndReport()
		},
	}
}

export const PageNumberHandler = withDependencies(
	process.env.browser ? [named(FeatureStateSymbol, name), BsiManagerSymbol] : [named(FeatureStateSymbol, name)],
	pageNumberHandlerFactory
)
