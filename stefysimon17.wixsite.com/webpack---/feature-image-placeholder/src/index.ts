import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { ServerImagePlaceholder } from './serverImagePlaceholder'
import { ComponentPropsExtenderSymbol } from 'feature-components'
import { createClientImagePlaceholder } from './clientImagePlaceholder'

export const page: ContainerModuleLoader = (bind) => {
	if (process.env.browser) {
		const ClientImagePlaceholder = createClientImagePlaceholder(window.__imageClientApi__)
		bind(ComponentPropsExtenderSymbol).to(ClientImagePlaceholder)
	} else {
		bind(ComponentPropsExtenderSymbol).to(ServerImagePlaceholder)
	}
}
