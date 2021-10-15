import { ComponentsRegistrarSymbol } from '@wix/thunderbolt-components-loader'
import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { ComponentsRegistrar } from './components/componentsRegistrar'

export const site: ContainerModuleLoader = (bind) => {
	bind(ComponentsRegistrarSymbol).to(ComponentsRegistrar)
}

export const editor = site
