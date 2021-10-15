import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { WixCodeSdkHandlersProviderSym } from '@wix/thunderbolt-symbols'
import { WarmupDataEnricherSymbol } from 'feature-warmup-data'
import { windowWixCodeSdkHandlers } from './sdk/windowSdkProvider'
import { WindowWixCodeWarmupDataEnricher } from './warmupDataEnricher'
import { WindowWixCodeSdkWarmupDataEnricherSymbol } from './symbols'

export const page: ContainerModuleLoader = (bind) => {
	bind(WixCodeSdkHandlersProviderSym).to(windowWixCodeSdkHandlers)
}

export const site: ContainerModuleLoader = (bind) => {
	bind(WarmupDataEnricherSymbol, WindowWixCodeSdkWarmupDataEnricherSymbol).to(WindowWixCodeWarmupDataEnricher)
}

export const editor: ContainerModuleLoader = (bind) => {
	bind(WindowWixCodeSdkWarmupDataEnricherSymbol).to(WindowWixCodeWarmupDataEnricher)
}

export const editorPage: ContainerModuleLoader = (bind) => {
	bind(WixCodeSdkHandlersProviderSym).to(windowWixCodeSdkHandlers)
}

export * from './symbols'
export * from './types'
