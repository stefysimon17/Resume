import { StoreWithSubscribe } from '../types'
import { BatchingStrategy, StoreNoUpdate } from '@wix/thunderbolt-symbols'

type Subscriber = (partialStore: Record<string, any>) => void
type Subscribers = Array<Subscriber>
type SomeCollection = Record<string, any>

export function extendStoreWithSubscribe<StoreType extends StoreNoUpdate<SomeCollection>>(
	store: StoreType,
	batchingStrategy: BatchingStrategy
): StoreWithSubscribe<StoreType> {
	const subscribers: Record<string, Subscribers> = {}
	const unSubscribers: Record<string, Subscribers> = {}
	const ALL_COMPS = 'All Comps'

	const trigger = (compId: string, compProps: Record<string, any>, handlers: Record<string, Subscribers>) =>
		handlers[compId] &&
		[...handlers[compId]].forEach((cb) => {
			cb(compProps)
		})
	function notifyComponents(partialStore: SomeCollection) {
		batchingStrategy.batch(() => {
			Object.entries(partialStore).forEach(([compId, compProps]) => {
				if (compProps) {
					trigger(compId, compProps, subscribers)
				} else {
					trigger(compId, compProps, unSubscribers)
				}
			})

			if (subscribers[ALL_COMPS]) {
				subscribers[ALL_COMPS].forEach((cb) => cb(partialStore))
			}
		})
	}

	store.subscribeToChanges((partial: SomeCollection) => notifyComponents(partial))

	const subscribeById = (id: string, cb: Subscriber) => {
		const unSubscribe = () => {
			if (!subscribers[id]) {
				return
			}
			const index = subscribers[id].indexOf(cb)
			if (index >= 0) {
				subscribers[id].splice(index, 1)
			}
			if (subscribers[id].length === 0) {
				delete subscribers[id]
			}
		}

		subscribers[id] = subscribers[id] || []
		unSubscribers[id] = unSubscribers[id] || []
		subscribers[id].push(cb)
		unSubscribers[id].push(unSubscribe)

		return unSubscribe
	}

	return {
		...store,
		subscribeById,
		subscribeToChanges: (callback) => subscribeById(ALL_COMPS, callback),
	}
}
