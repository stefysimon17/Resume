import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import {
	LifeCycle,
	HeadContentSymbol,
	RendererSymbol,
	BatchingStrategySymbol,
	ComponentsStylesOverridesSymbol,
	AppDidMountPromiseSymbol,
} from '@wix/thunderbolt-symbols'
import type { RendererProps, AppProps, ClientRenderResponse, IRendererPropsProvider } from './types'
import { HeadContent } from './HeadContent'
import { RendererPropsProvider } from './RendererPropsProvider'
import { ReactClientRenderer, appDidMountPromise } from './clientRenderer/reactClientRenderer'
import { PageMountUnmountSubscriber } from './clientRenderer/pageMountUnmountSubscriber'
import { ClientBatchingStrategy } from './components/batchingStrategy'
import { ComponentsStylesOverrides } from './ComponentsStylesOverrides'
import { RendererPropsProviderSym } from './symbols'

export const site: ContainerModuleLoader = (bind) => {
	bind(AppDidMountPromiseSymbol).toConstantValue(appDidMountPromise)
	bind(RendererSymbol).to(ReactClientRenderer)
	bind(RendererPropsProviderSym).to(RendererPropsProvider)
	bind(BatchingStrategySymbol, LifeCycle.AppDidMountHandler).to(ClientBatchingStrategy)
	bind(HeadContentSymbol).to(HeadContent)
	bind(LifeCycle.AppWillLoadPageHandler).to(PageMountUnmountSubscriber)
	bind(ComponentsStylesOverridesSymbol).to(ComponentsStylesOverrides)
}

export const editor: ContainerModuleLoader = site

export { RendererProps, AppProps, ClientRenderResponse, RendererPropsProviderSym, IRendererPropsProvider }
