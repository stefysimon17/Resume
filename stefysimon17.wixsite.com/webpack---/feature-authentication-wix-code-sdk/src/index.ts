import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { WixCodeSdkHandlersProviderSym } from '@wix/thunderbolt-symbols'
import { authenticationCodeSdkHandlersProvider } from './sdk/authenticationSdkProvider'
import { CaptchaDialog } from './captchaDialogApi'
import { CaptchaDialogApiSymbol } from './symbols'

export const page: ContainerModuleLoader = (bind) => {
	bind(CaptchaDialogApiSymbol).to(CaptchaDialog)
	bind(WixCodeSdkHandlersProviderSym).to(authenticationCodeSdkHandlersProvider)
}

export * from './symbols'
export * from './types'
