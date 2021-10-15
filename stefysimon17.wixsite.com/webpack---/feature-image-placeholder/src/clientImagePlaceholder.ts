import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { name } from './symbols'
import { PageFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import createFactory from './createPropsExtenderFactory'

export function createClientImagePlaceholder(imageClientApi: any) {
	const clientImagePlaceholderFactory = createFactory(imageClientApi)

	return withDependencies([named(PageFeatureConfigSymbol, name)], clientImagePlaceholderFactory)
}
