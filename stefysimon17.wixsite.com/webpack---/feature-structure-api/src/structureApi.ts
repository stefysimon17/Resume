import { IStructureStore, IStructureAPI, Structure, IBaseStructureAPI } from '@wix/thunderbolt-symbols'
import { withDependencies } from '@wix/thunderbolt-ioc'
import { ComponentsLoaderSymbol, IComponentsLoader } from '@wix/thunderbolt-components-loader'
import { BaseStructureAPISym } from './symbols'

const structureAPI = (
	structureStore: IStructureStore,
	baseStructureAPI: IBaseStructureAPI,
	componentsLoader: IComponentsLoader
): IStructureAPI => {
	return {
		...baseStructureAPI,
		addShellStructure: async () => {
			const structure = {
				DYNAMIC_STRUCTURE_CONTAINER: {
					components: [],
					componentType: 'DynamicStructureContainer',
				},
				'site-root': {
					components: [],
					componentType: 'DivWithChildren',
				},
				main_MF: {
					components: ['site-root', 'DYNAMIC_STRUCTURE_CONTAINER'],
					componentType: 'DivWithChildren',
				},
			}
			structureStore.update(structure)

			await Promise.all([
				componentsLoader.loadComponent('PageMountUnmount'),
				componentsLoader.loadComponents(structure),
			])
		},
		addPageAndRootToRenderedTree: (pageId: string, contextId: string) => {
			const pageBgId = `pageBackground_${pageId}`
			const hasPageBackground = structureStore.get(pageBgId)
			const isContentReflowBannerShown = structureStore
				.get('main_MF')
				.components.includes('CONTENT_REFLOW_BANNER')
			const rootComponents = ['SCROLL_TO_TOP', 'site-root', 'DYNAMIC_STRUCTURE_CONTAINER', 'SCROLL_TO_BOTTOM']

			if (hasPageBackground) {
				rootComponents.splice(1, 0, 'BACKGROUND_GROUP')
			}

			if (structureStore.get('WIX_ADS')) {
				rootComponents.splice(1, 0, 'WIX_ADS')
			}

			if (structureStore.get('SKIP_TO_CONTENT_BTN')) {
				rootComponents.splice(1, 0, 'SKIP_TO_CONTENT_BTN')
			}

			if (isContentReflowBannerShown) {
				rootComponents.splice(1, 0, 'CONTENT_REFLOW_BANNER')
			}

			const wrapperId = baseStructureAPI.getPageWrapperComponentId(pageId, contextId)
			const componentsToAdd = {
				main_MF: {
					components: rootComponents,
					componentType: 'DivWithChildren',
				},
				'site-root': {
					components: ['masterPage'],
					componentType: 'DivWithChildren',
				},
				SITE_PAGES: {
					componentType: 'PageGroup',
					components: [wrapperId],
				},
				[wrapperId]: { componentType: 'PageMountUnmount', components: [pageId] },
				SCROLL_TO_TOP: {
					components: [],
					componentType: 'Anchor',
				},
				SCROLL_TO_BOTTOM: {
					components: [],
					componentType: 'Anchor',
				},
				...(hasPageBackground && {
					BACKGROUND_GROUP: {
						componentType: 'BackgroundGroup',
						components: [pageBgId],
					},
				}),
				...(isContentReflowBannerShown && {
					CONTENT_REFLOW_BANNER: {
						componentType: 'ContentReflowBanner',
						components: [],
					},
				}),
			}

			structureStore.update(componentsToAdd)
		},
	}
}

export const StructureAPI = withDependencies([Structure, BaseStructureAPISym, ComponentsLoaderSymbol], structureAPI)
