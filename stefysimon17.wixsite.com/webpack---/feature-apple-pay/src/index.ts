import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { TpaHandlerProviderSymbol } from '@wix/thunderbolt-symbols'
import { ApplePayTPAHandlers } from './tpaHandlers'

export const page: ContainerModuleLoader = (bind) => {
	bind(TpaHandlerProviderSymbol).to(ApplePayTPAHandlers)
}
