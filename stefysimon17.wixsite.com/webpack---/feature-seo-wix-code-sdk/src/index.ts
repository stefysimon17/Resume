import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { PlatformEvnDataProviderSymbol, WixCodeSdkHandlersProviderSym } from '@wix/thunderbolt-symbols'
import { seoPlatformEnvDataProvider, seoWixCodeSdkHandlersProvider } from './sdk/seoSdkProvider'

export const site: ContainerModuleLoader = (bind) => {
	bind(PlatformEvnDataProviderSymbol).to(seoPlatformEnvDataProvider)
}
export const page: ContainerModuleLoader = (bind) => {
	bind(WixCodeSdkHandlersProviderSym).to(seoWixCodeSdkHandlersProvider)
}

export const editor: ContainerModuleLoader = site
export const editorPage: ContainerModuleLoader = page

export * from './symbols'
export * from './types'
