import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { FeatureStateSymbol, IPropsStore, PageFeatureConfigSymbol, Props } from '@wix/thunderbolt-symbols'
import type {
	CompareDataDeep,
	HaveEqualBackgrounds,
	PageTransitionsDidMountFactory,
	PageTransitionsPageState,
	PageTransitionsPageConfig,
} from './types'
import { name, PageTransitionsCompletedSymbol } from './symbols'
import { ComponentWillMount, ViewerComponent } from 'feature-components'
import type { IFeatureState } from 'thunderbolt-feature-state'
import type { IPageTransitionsCompleted } from './IPageTransitionsCompleted'
import { ScrollRestorationAPISymbol, IScrollRestorationAPI } from 'feature-scroll-restoration'

const PROPS_TO_COMPARE = [
	'type',
	'alignType',
	'fittingType',
	'scrollType',
	'colorOverlay',
	'colorOverlayOpacity',
	'color',
	'videoId',
	'uri',
	'opacity',
]

const compareDataDeep: CompareDataDeep = (prevData, currentData, refKeys, propsToCheck) => {
	// @ts-ignore
	const equal = propsToCheck.every((key: string) => (prevData && prevData[key]) === (currentData && currentData[key]))
	return (
		equal &&
		refKeys.every((ref: string) =>
			prevData || currentData
				? // @ts-ignore
				  compareDataDeep(prevData && prevData[ref], currentData && currentData[ref], refKeys, propsToCheck)
				: true
		)
	)
}

const haveEqualBackgrounds: HaveEqualBackgrounds = (currentPageBackground, prevPageBackground) => {
	if (!prevPageBackground || !currentPageBackground) {
		return false
	}

	// prev page background media data
	const prevMediaData = prevPageBackground.mediaRef
	const prevMediaDataType = prevMediaData && prevMediaData.type
	// current page background media data
	const currentMediaData = currentPageBackground.mediaRef
	const currentMediaDataType = currentMediaData && currentMediaData.type

	const isOnlyColor = !prevMediaData && !currentMediaData
	const isMediaTypeEqual = isOnlyColor || prevMediaDataType === currentMediaDataType
	const shouldIgnoreColor = prevMediaDataType === 'WixVideo' && isMediaTypeEqual

	const refKeys = ['mediaRef', 'imageOverlay']
	let propsToCheck = [...PROPS_TO_COMPARE]
	if (shouldIgnoreColor) {
		const colorIndex = propsToCheck.indexOf('color')
		propsToCheck.splice(colorIndex, 1)
	} else if (isOnlyColor) {
		propsToCheck = ['color']
	}

	return isMediaTypeEqual && compareDataDeep(prevPageBackground, currentPageBackground, refKeys, propsToCheck)
}

const componentTransitionsWillMountFactory = (
	pageFeatureConfig: PageTransitionsPageConfig,
	propsStore: IPropsStore,
	pageTransitionsCompleted: IPageTransitionsCompleted,
	scrollRestorationAPI: IScrollRestorationAPI,
	featureState: IFeatureState<PageTransitionsPageState>
): ComponentWillMount<ViewerComponent> => {
	return {
		componentTypes: ['Page', 'PageBackground'],
		componentWillMount(compWithTransition) {
			const state = featureState.get()
			const transitionEnabled = state ? state.nextTransitionEnabled : true

			const prevPageBg = state?.pageBackground
			const currentPageBg = pageFeatureConfig.pageBackground

			if (compWithTransition.componentType === 'Page') {
				const pageId = compWithTransition.id

				propsStore.update({
					SITE_PAGES: {
						transitionEnabled,
						onTransitionStarting: () => {
							if (!scrollRestorationAPI.getScrollYHistoryState()) {
								scrollRestorationAPI.scrollToTop()
							}
						},
						onTransitionComplete: () => {
							pageTransitionsCompleted.notifyPageTransitionsCompleted(pageId)
							if (scrollRestorationAPI.getScrollYHistoryState()) {
								scrollRestorationAPI.restoreScrollPosition()
							}
						},
					},
				})
			} else {
				const bgTransitionEnabled = transitionEnabled && !haveEqualBackgrounds(currentPageBg, prevPageBg)
				propsStore.update({
					BACKGROUND_GROUP: {
						transitionEnabled: bgTransitionEnabled,
					},
				})

				featureState.update(() => ({
					nextTransitionEnabled: true,
					pageBackground: currentPageBg,
					isFirstMount: state ? state.isFirstMount : true,
				}))
			}
		},
	}
}

export const ComponentTransitionsWillMount = withDependencies(
	[
		named(PageFeatureConfigSymbol, name),
		Props,
		PageTransitionsCompletedSymbol,
		ScrollRestorationAPISymbol,
		named(FeatureStateSymbol, name),
	],
	componentTransitionsWillMountFactory
)

const pageTransitionsDidMountFactory: PageTransitionsDidMountFactory = (pageTransitionsCompleted, featureState) => {
	return {
		pageDidMount(pageId) {
			const state = featureState.get()

			if (!state || state.isFirstMount) {
				pageTransitionsCompleted.notifyPageTransitionsCompleted(pageId)
			}

			featureState.update((current) => ({
				...current,
				isFirstMount: false,
			}))
		},
	}
}

export const PageTransitionsDidMount = withDependencies(
	[PageTransitionsCompletedSymbol, named(FeatureStateSymbol, name)],
	pageTransitionsDidMountFactory
)
