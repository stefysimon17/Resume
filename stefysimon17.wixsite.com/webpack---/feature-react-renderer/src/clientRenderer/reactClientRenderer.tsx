import React from 'react'
import ReactDOM from 'react-dom'
import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	IRenderer,
	BatchingStrategy,
	BatchingStrategySymbol,
	ExperimentsSymbol,
	Experiments,
} from '@wix/thunderbolt-symbols'
import { createPromise } from '@wix/thunderbolt-commons'
import { IRendererPropsProvider, RendererProps } from '../types'
import { RendererPropsProviderSym } from '../symbols'

const { resolver: appDidMountResolver, promise: waitForAppDidMount } = createPromise()
export const appDidMountPromise = waitForAppDidMount

export const ReactClientRenderer = withDependencies(
	[RendererPropsProviderSym, BatchingStrategySymbol, ExperimentsSymbol],
	(
		rendererProps: IRendererPropsProvider,
		batchingStrategy: BatchingStrategy,
		experiments: Experiments
	): IRenderer<RendererProps, Promise<void>> => ({
		getRendererProps: rendererProps.getRendererProps,
		init: async () => {
			await rendererProps.resolveRendererProps()
		},
		render: async (target = document.getElementById('SITE_CONTAINER') as HTMLElement) => {
			await window.reactAndReactDOMLoaded
			const App = require('../components/App').default // App creates a React Context on module state, so it has to be evaluated once React is defined.
			const app = (
				<React.StrictMode>
					<App
						{...rendererProps.getRendererProps()}
						batchingStrategy={batchingStrategy}
						onDidMount={appDidMountResolver}
					/>
				</React.StrictMode>
			)
			if (target.firstChild) {
				experiments['specs.thunderbolt.react_experimental']
					? // @ts-ignore
					  ReactDOM.unstable_createRoot(target, { hydrate: true }).render(app)
					: ReactDOM.hydrate(app, target)
			} else {
				ReactDOM.render(app, target)
			}
			await waitForAppDidMount
		},
	})
)
