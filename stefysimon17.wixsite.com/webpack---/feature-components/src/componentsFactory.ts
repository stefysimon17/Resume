import { AppStructure } from '@wix/thunderbolt-symbols'
import type { ViewerComponentProvider, TraitProvider, ViewerComponent, ComponentDriverFactory } from './types'
import _ from 'lodash'

export const viewerComponentProvider = (
	baseTraits: Array<TraitProvider>,
	componentDriversArray: Array<ComponentDriverFactory<ViewerComponent>>,
	componentsConfig: { [featureName: string]: { [componentId: string]: unknown } }
): ViewerComponentProvider => {
	const driversByComponentType = _.groupBy(componentDriversArray, 'componentType')
	return {
		createComponents: (pageStructure: AppStructure) => {
			return _.mapValues(pageStructure, ({ componentType, uiType }, id) => {
				const getConfig = (name: string) => componentsConfig[name][id]
				const baseComponent: ViewerComponent = Object.assign(
					{ id, componentType, uiType, getConfig },
					...baseTraits.map((trait) => trait(id))
				)
				if (!driversByComponentType[componentType]) {
					return baseComponent
				}
				return Object.assign(
					{},
					baseComponent,
					...driversByComponentType[componentType].map((x) => x.getComponentDriver(baseComponent))
				)
			})
		},
	}
}
