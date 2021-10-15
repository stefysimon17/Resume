import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { EmbeddedInIframe } from './embeddedInIframe'
import { LifeCycle } from '@wix/thunderbolt-symbols'

export const site: ContainerModuleLoader = (bind) => {
	bind(LifeCycle.AppDidMountHandler).to(EmbeddedInIframe)
}
