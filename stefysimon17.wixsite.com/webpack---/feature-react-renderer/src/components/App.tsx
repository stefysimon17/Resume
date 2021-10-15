import StructureComponent from './StructureComponent'
import { AppContextProvider } from './AppContext'
import React, { Fragment, useEffect } from 'react'
import { AppProps, RendererProps } from '../types'
import { extendStoreWithSubscribe } from './extendStoreWithSubscribe'
import { IPropsStore, IStructureStore, IStylesStore } from '@wix/thunderbolt-symbols'
import ComponentsStylesOverrides from './ComponentsStylesOverrides'

function App({
	structure,
	props,
	styles,
	compsLifeCycle,
	compEventsRegistrar,
	comps,
	compControllers,
	logger,
	translate,
	batchingStrategy,
	createCompControllerArgs,
	onDidMount = () => {},
	contextCallbackRef = () => {},
}: AppProps) {
	const contextValue: RendererProps = {
		structure: extendStoreWithSubscribe<IStructureStore>(structure, batchingStrategy),
		props: extendStoreWithSubscribe<IPropsStore>(props, batchingStrategy),
		styles: extendStoreWithSubscribe<IStylesStore>(styles, batchingStrategy),
		compsLifeCycle,
		compEventsRegistrar,
		logger,
		comps,
		compControllers,
		translate,
		createCompControllerArgs,
	}

	useEffect(onDidMount, [onDidMount])

	return (
		<Fragment>
			<AppContextProvider initialContextValue={contextValue} ref={contextCallbackRef}>
				<ComponentsStylesOverrides />
				<StructureComponent key="main_MF" id="main_MF" />
			</AppContextProvider>
		</Fragment>
	)
}

export default App
