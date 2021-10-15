import React from 'react'

import { multi, optional, withDependencies } from '@wix/thunderbolt-ioc'
import { AppStructure, ComponentLibrariesSymbol } from '@wix/thunderbolt-symbols'
import type {
	ComponentsLoaderRegistry,
	ComponentsRegistry,
	ComponentLibraries,
	ThunderboltHostAPI,
	ComponentLoaderFunction,
	CompControllersRegistry,
	IComponentsRegistrar,
	ComponentModule,
	IWrapComponent,
} from './types'
import { IComponentsLoader } from './IComponentLoader'
import { getCompClassType, taskify } from '@wix/thunderbolt-commons'
import { ComponentsRegistrarSymbol, ComponentWrapperSymbol } from './symbols'

type ComponentsLoaderFactory = (
	componentsLibraries: ComponentLibraries,
	componentsRegistrars: Array<IComponentsRegistrar>,
	componentWrapper: IWrapComponent
) => IComponentsLoader

const isComponentModule = <T>(loader: any): loader is ComponentModule<T> => !!loader.component

const componentsLoaderFactory: ComponentsLoaderFactory = (
	componentsLibraries,
	componentsRegistrars,
	componentWrapper?: IWrapComponent
) => {
	const componentsLoaderRegistry: ComponentsLoaderRegistry = {}
	const componentsRegistry: ComponentsRegistry = {}
	const compControllersRegistry: CompControllersRegistry = {}

	const loadComponent = async (compType: string) => {
		const loader = componentsLoaderRegistry[compType]
		if (!loader || componentsRegistry[compType]) {
			return
		}

		process.env.browser && (await window.externalsRegistry.react.loaded) // components require React within their code so they have to be evaluated once React is defined.
		const module = await taskify(() => loader())
		const wrapComponent = componentWrapper?.wrapComponent || (React.memo as IWrapComponent['wrapComponent'])
		if (isComponentModule(module)) {
			module.component.displayName = compType
			componentsRegistry[compType] = wrapComponent(module.component)
			if (module.controller) {
				compControllersRegistry[compType] = module.controller
			}
		} else {
			componentsRegistry[compType] = wrapComponent(module.default)
		}
	}

	const getRequiredComps = (structure: AppStructure) => {
		const allCompClassTypes = Object.entries(structure).map(([_, { componentType, uiType }]) =>
			getCompClassType(componentType, uiType)
		)
		const uniqueCompTypes = [...new Set(allCompClassTypes)]
		return uniqueCompTypes
	}

	const hostAPI: ThunderboltHostAPI = {
		registerComponent: <Props>(
			componentType: string,
			loadingFunction: ComponentLoaderFunction<Props>,
			uiType?: string
		) => {
			const compClassType = getCompClassType(componentType, uiType)
			if (process.env.NODE_ENV === 'development' && componentsLoaderRegistry[compClassType]) {
				console.warn(
					`${compClassType} was already registered. Please remove it from thunderbolt components ASAP`
				)
			}
			componentsLoaderRegistry[compClassType] = loadingFunction
		},
	}

	// ORDER MATTERS!!!
	const registerLibraries = taskify(async () => {
		return componentsRegistrars
			.concat(await componentsLibraries)
			.reduce(
				(acc, { registerComponents }) => acc.then(() => taskify(() => registerComponents(hostAPI))),
				Promise.resolve()
			)
	})

	return {
		getComponentsMap: () => componentsRegistry,
		getCompControllersMap: () => compControllersRegistry,
		loadComponents: async (structure) => {
			await registerLibraries

			const requiredComps = getRequiredComps(structure)
			return Promise.all(requiredComps.map((compType) => loadComponent(compType)))
		},
		loadAllComponents: async () => {
			await registerLibraries

			const requiredComps = Object.keys(componentsLoaderRegistry)
			return Promise.all(requiredComps.map((compType) => loadComponent(compType)))
		},
		loadComponent: async (componentType: string, uiType?: string) => {
			await registerLibraries
			return loadComponent(getCompClassType(componentType, uiType))
		},
	}
}

export const ComponentsLoader = withDependencies(
	[ComponentLibrariesSymbol, multi(ComponentsRegistrarSymbol), optional(ComponentWrapperSymbol)],
	componentsLoaderFactory
)
