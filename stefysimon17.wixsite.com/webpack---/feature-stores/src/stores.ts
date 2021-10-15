import { Store, Subscriber } from '@wix/thunderbolt-symbols'
import { getFullId } from '@wix/thunderbolt-commons'

type Subscribers<T> = Array<Subscriber<T>>

export const getStore = <T extends { [key: string]: any }>(): Store<T> => {
	let stores = [] as Array<{ id: string; store: T }>
	let generalStore = {} as T

	const getPageStore = (id: string, pageId?: string): T => {
		// Although we use Array.find the number of stores is 3 at most (page, masterPage and a lightbox) which means that we are still at O(1)
		const pageStore =
			stores.find(({ store }) => store[id] || store[getFullId(id)]) ||
			stores.find(({ store }) => pageId && store[pageId])

		return pageStore ? pageStore.store : generalStore
	}

	const getContextIdOfCompId = (compId: string): string | null => {
		const pageStore = getPageStore(compId)
		if (pageStore === generalStore) {
			return null
		}
		const { id } = stores.find(({ store }) => store === pageStore)!
		return id
	}

	const subscribers: Subscribers<T> = []
	const update = (partialStore: T) => {
		const partialStoreWithCompleteEntries = Object.entries(partialStore).reduce((acc, [compId, value]) => {
			const pageStore = getPageStore(compId, value?.pageId)
			pageStore[compId as keyof T] = { ...pageStore[compId], ...value }

			return { ...acc, [compId]: pageStore[compId] }
		}, {} as T)

		subscribers.forEach((cb) => {
			cb(partialStoreWithCompleteEntries)
		})
	}

	const set = (partialStore: T) => {
		Object.entries(partialStore).forEach(([compId, value]) => {
			const pageStore = getPageStore(compId)
			pageStore[compId as keyof T] = { ...value }
		}, {} as T)

		subscribers.forEach((cb) => {
			cb(partialStore)
		})
	}

	return {
		updatePageId: (id: string, pageId?: string) => {
			if (pageId) {
				delete getPageStore(id)[id]
				const newPageStore = getPageStore(id, pageId) as { [key: string]: any }
				newPageStore[id] = {}
			}
		},
		get: (id: string) => {
			const pageStore = getPageStore(id)!
			return pageStore[id]
		},
		getContextIdOfCompId,
		setChildStore: (contextId: string, pageNewStore?: T) => {
			if (pageNewStore) {
				const otherPagesStores = stores.filter(({ id }) => id !== contextId)
				const storesItem = { id: contextId, store: { ...pageNewStore } }
				stores = [storesItem, ...otherPagesStores]

				// Apply changes made before adding the page to the store
				generalStore = Object.entries(generalStore).reduce((acc, [compId, value]) => {
					if (pageNewStore[compId] || pageNewStore[getFullId(compId)]) {
						storesItem.store[compId as keyof T] = { ...storesItem.store[compId], ...value }
						return acc
					}

					return { ...acc, [compId]: value }
				}, {} as T)
			} else {
				const pageCurrentStore = stores.find(({ id }) => id === contextId)
				if (!pageCurrentStore) {
					return
				}
				stores = stores.filter(({ id }) => id !== contextId)
				const emptyStore = Object.keys(pageCurrentStore!.store).reduce((acc, compId) => {
					return { ...acc, ...{ [compId]: null } }
				}, {}) as T
				subscribers.forEach((cb) => cb(emptyStore))
			}
		},
		getEntireStore: () => Object.assign({}, ...stores.reverse().map(({ store }) => store), generalStore),
		update,
		set,
		subscribeToChanges: (cb: Subscriber<T>) => {
			subscribers.push(cb)
		},
	}
}
