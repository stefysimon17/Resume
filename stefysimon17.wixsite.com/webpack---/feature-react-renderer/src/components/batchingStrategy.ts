import { withDependencies } from '@wix/thunderbolt-ioc'
import { IStructureStore, Structure, BatchingStrategy, IAppDidMountHandler } from '@wix/thunderbolt-symbols'
import { INavigationManager, NavigationManagerSymbol } from 'feature-navigation-manager'
import ReactDOM from 'react-dom'

const createBatchingStrategy = (batchingFunction: (update: () => void) => void): BatchingStrategy => {
	let promise: Promise<void> | null = null
	const batchingStrategy: BatchingStrategy = {
		batch: (fn) => {
			if (!promise) {
				batchingFunction(fn)
			} else {
				promise.then(() => {
					batchingFunction(fn)
					promise = null
				})
			}
		},
		batchAsync: (waitBeforeBatch) => {
			promise = waitBeforeBatch
		},
	}
	return batchingStrategy
}

export const ClientBatchingStrategy = withDependencies<BatchingStrategy & IAppDidMountHandler>(
	[Structure, NavigationManagerSymbol],
	(structureStore: IStructureStore, navigationManager: INavigationManager) => {
		let fns = [] as Array<() => void>
		let finishRenderFirstPage = false
		const batchingStartegy = createBatchingStrategy((fn) => {
			if (navigationManager.shouldBlockRender() && finishRenderFirstPage) {
				fns.push(fn)
				return
			}
			if (fns.length) {
				const localFns = [...fns, fn]
				fns = []
				ReactDOM.unstable_batchedUpdates(() => {
					localFns.forEach((deferredFunc) => deferredFunc())
				})
			} else {
				ReactDOM.unstable_batchedUpdates(fn)
			}
		})
		return {
			...batchingStartegy,
			appDidMount: () => {
				finishRenderFirstPage = true
			},
		}
	}
)

export const ServerBatchingStrategy = withDependencies<BatchingStrategy>([], () =>
	createBatchingStrategy((fn) => {
		fn()
	})
)
