import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { PlatformEvnDataProviderSymbol } from '@wix/thunderbolt-symbols'

import { –°omponentsRegistryPlatformEnvDataProvider } from './componentsRegistry'

export const site: ContainerModuleLoader = (bind) => {
	bind(PlatformEvnDataProviderSymbol).to(–°omponentsRegistryPlatformEnvDataProvider)
}

export const editor: ContainerModuleLoader = (bind) => {
	bind(PlatformEvnDataProviderSymbol).to(–°omponentsRegistryPlatformEnvDataProvider)
}

export * from './symbols'
