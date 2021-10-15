import {
	RendererPropsExtenderSym,
	WixCodeSdkHandlersProviderSym,
	PlatformPropsSyncManagerSymbol,
} from '@wix/thunderbolt-symbols'
import type {
	ComponentLibraries,
	ComponentsLoaderRegistry,
	ComponentLoaderFunction,
	ThunderboltHostAPI,
	CompController,
	CreateCompControllerArgs,
	CompControllersRegistry,
	ComponentsRegistry,
	UpdateCompProps,
	IComponentsRegistrar,
	IWrapComponent,
} from './types'
import { ComponentsLoaderSymbol, ComponentsRegistrarSymbol, ComponentWrapperSymbol } from './symbols'
import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { ComponentsLoaderInit } from './componentsLoaderInit'
import { ComponentsLoader } from './componentsLoader'
import type { IComponentsLoader } from './IComponentLoader'
import { controlledComponentFactory } from './updateControlledComponentProps'
import platformPropsSyncManager from './platformPropsSyncManager'

// Public loader
export const site: ContainerModuleLoader = (bind) => {
	bind(RendererPropsExtenderSym).to(ComponentsLoaderInit)
	bind(ComponentsLoaderSymbol).to(ComponentsLoader)
	bind(RendererPropsExtenderSym).to(controlledComponentFactory)
	bind(WixCodeSdkHandlersProviderSym, PlatformPropsSyncManagerSymbol).to(platformPropsSyncManager)
}

export const editor = site

// Public Symbols
export { ComponentsLoaderSymbol, ComponentsRegistrarSymbol, ComponentWrapperSymbol }

// Public Types
export type {
	IWrapComponent,
	IComponentsLoader,
	ComponentLibraries,
	IComponentsRegistrar,
	ComponentsLoaderRegistry,
	ComponentLoaderFunction,
	ThunderboltHostAPI,
	CompController,
	CreateCompControllerArgs,
	CompControllersRegistry,
	ComponentsRegistry,
	UpdateCompProps,
}
