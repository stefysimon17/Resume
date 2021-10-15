import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { WindowMessageRegistrar } from './windowMessageRegistrar'
import { WindowMessageRegistrarSymbol } from './symbols'
import { SsrWindowMessageRegistrar } from './ssr/windowMessageRegistrar'

const commonModuleLoader: ContainerModuleLoader = (bind) => {
	bind(WindowMessageRegistrarSymbol).to(process.env.browser ? WindowMessageRegistrar : SsrWindowMessageRegistrar)
}

export const site: ContainerModuleLoader = commonModuleLoader
export const editor: ContainerModuleLoader = commonModuleLoader

export { WindowMessageRegistrarSymbol } from './symbols'
export type { WindowMessageConsumer, IWindowMessageRegistrar } from './types'
