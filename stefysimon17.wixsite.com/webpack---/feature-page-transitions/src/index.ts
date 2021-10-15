import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { ComponentTransitionsWillMount, PageTransitionsDidMount } from './pageTransitions'
import { PageTransitionsApi } from './pageTransitionsApi'
import { PageTransitionsCompleted } from './pageTransitionsCompleted'
import { PageTransitionsSymbol, PageTransitionsCompletedSymbol } from './symbols'
import { LifeCycle } from '@wix/thunderbolt-symbols'
import { ComponentWillMountSymbol } from 'feature-components'

export const page: ContainerModuleLoader = (bind) => {
	bind(PageTransitionsCompletedSymbol).to(PageTransitionsCompleted)
	bind(PageTransitionsSymbol).to(PageTransitionsApi)
	bind(ComponentWillMountSymbol).to(ComponentTransitionsWillMount)
	bind(LifeCycle.PageDidMountHandler).to(PageTransitionsDidMount)
}

export const editorPage: ContainerModuleLoader = (bind) => {
	bind(PageTransitionsSymbol).to(PageTransitionsApi)
	bind(ComponentWillMountSymbol).to(ComponentTransitionsWillMount)
	bind(LifeCycle.PageDidMountHandler).to(PageTransitionsDidMount)
}
export const editor: ContainerModuleLoader = (bind) => {
	bind(PageTransitionsCompletedSymbol).to(PageTransitionsCompleted)
}

export { PageTransitionsSymbol, PageTransitionsCompletedSymbol }
export type { IPageTransitionsCompleted } from './IPageTransitionsCompleted'
export type { IPageTransition } from './types'
