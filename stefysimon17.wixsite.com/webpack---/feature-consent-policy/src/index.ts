import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { WixCodeSdkHandlersProviderSym, LifeCycle } from '@wix/thunderbolt-symbols'
import { ConsentPolicySymbol } from './symbols'
import { ConsentPolicyBrowser } from './consentPolicyBrowser'
import { ConsentPolicySdkHandlersProvider } from './consentPolicySdkHandlersProvider'

export { createConsentPolicyLogger } from './consentPolicyLogger'

export const site: ContainerModuleLoader = (bind) => {
	bind(ConsentPolicySymbol).to(ConsentPolicyBrowser)
}

export const page: ContainerModuleLoader = (bind) => {
	bind(WixCodeSdkHandlersProviderSym, LifeCycle.PageDidMountHandler).to(ConsentPolicySdkHandlersProvider)
}

export const editor: ContainerModuleLoader = (bind) => {
	bind(ConsentPolicySymbol).to(ConsentPolicyBrowser)
}

export * from './types'
export * from './symbols'
