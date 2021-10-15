import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { PlatformEvnDataProviderSymbol, WixCodeSdkHandlersProviderSym } from '@wix/thunderbolt-symbols'
import { CommonConfigImpl } from './commonConfig'
import { CommonConfigSymbol, name } from './symbols'
import type { ICommonConfig } from './types'
import { commonConfigSdkHandlersProvider } from './commonConfigSdkHandlersProvider'

export { CommonConfigSymbol, ICommonConfig, name }

export const site: ContainerModuleLoader = (bind) => {
	bind(CommonConfigSymbol, PlatformEvnDataProviderSymbol).to(CommonConfigImpl)
}

export const page: ContainerModuleLoader = (bind) => {
	bind(WixCodeSdkHandlersProviderSym).to(commonConfigSdkHandlersProvider)
}

export const editor: ContainerModuleLoader = site
export const editorPage: ContainerModuleLoader = page
