import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { ReducedMotion } from './reducedMotion'
import { ComponentPropsExtenderSymbol } from 'feature-components'

export const page: ContainerModuleLoader = (bind) => {
	bind(ComponentPropsExtenderSymbol).to(ReducedMotion)
}
