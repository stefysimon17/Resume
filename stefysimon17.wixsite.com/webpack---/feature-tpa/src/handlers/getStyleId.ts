import { name } from '../symbols'
import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { TpaPageConfig } from '../types'
import { PageFeatureConfigSymbol, TpaHandlerProvider } from '@wix/thunderbolt-symbols'

export const GetStyleIdHandler = withDependencies(
	[named(PageFeatureConfigSymbol, name)],
	({ widgets }: TpaPageConfig): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				getStyleId(compId, msgData, { originCompId }): string {
					return widgets[originCompId].styleId
				},
			}
		},
	})
)
