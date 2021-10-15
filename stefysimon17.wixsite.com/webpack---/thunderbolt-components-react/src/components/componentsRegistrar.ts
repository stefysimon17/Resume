import { withDependencies } from '@wix/thunderbolt-ioc'
import { IComponentsRegistrar } from '@wix/thunderbolt-components-loader'
import { componentsLoaders } from './componentsLoaders'

export const ComponentsRegistrar = withDependencies<IComponentsRegistrar>([], () => {
	return {
		registerComponents: (hostAPI) => {
			Object.entries(componentsLoaders).forEach(([compType, loadComponent]) => {
				const [componentType, uiType] = compType.split('_')
				hostAPI.registerComponent(componentType, loadComponent, uiType)
			})
		},
	}
})
