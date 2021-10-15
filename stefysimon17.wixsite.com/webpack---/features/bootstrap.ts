import * as thunderbolt from './thunderbolt/Thunderbolt'
import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'

const featureLoaders = [thunderbolt]

export const site: ContainerModuleLoader = (bind) => featureLoaders.forEach(({ site: siteLoader }) => siteLoader(bind))
