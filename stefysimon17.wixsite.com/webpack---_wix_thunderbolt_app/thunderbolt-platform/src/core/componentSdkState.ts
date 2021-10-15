import { CreateSdkState, SetSdkStateFn } from '@wix/thunderbolt-symbols'

type StateStore = {
	[compId: string]: {
		[namespace: string]: {
			[key: string]: unknown
		}
	}
}

export type ComponentSdkStateFactory = {
	createSdkState(compId: string): CreateSdkState
	clearStateByPredicate(predicate: (compId: string) => boolean): void
}

export function componentSdkStateFactory(): ComponentSdkStateFactory {
	const stateStore: StateStore = {}

	return {
		createSdkState(compId) {
			return (initialState, namespace = 'comp') => {
				stateStore[compId] = stateStore[compId] || {}
				stateStore[compId][namespace] = stateStore[compId][namespace] || { ...initialState }

				const setState: SetSdkStateFn = (partialState) => {
					Object.assign(stateStore[compId][namespace], partialState)
				}

				const state = stateStore[compId][namespace]

				return [state as typeof initialState, setState]
			}
		},
		clearStateByPredicate(predicate) {
			Object.keys(stateStore).forEach((compId) => {
				if (predicate(compId)) {
					delete stateStore[compId]
				}
			})
		},
	}
}
