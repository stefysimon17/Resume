import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	CompActionsSym,
	ICompActionsStore,
	ICompEventsRegistrar,
	CompEventsRegistrarSubscriber,
	Props,
	IPropsStore,
	ActionProps,
	PropsMap,
} from '@wix/thunderbolt-symbols'
import { getFullId, isDisplayedOnly } from '@wix/thunderbolt-commons'
import { NavigationManagerSymbol, INavigationManager } from 'feature-navigation-manager'

const eventSymbol = Symbol('eventSymbol')
type EventPropFunction = ((...args: Array<any>) => void) & {
	[eventSymbol]: true
}
type Subscribers = Array<CompEventsRegistrarSubscriber>

const isEventPropFunction = (callback: any = {}) => !!callback[eventSymbol]
const createEventPropFunction = (
	compActionsStore: ICompActionsStore,
	eventName: string,
	compId: string,
	navigationManager: INavigationManager
): EventPropFunction => {
	const getCompActionHandlers = () => {
		const compActions = compActionsStore.get(compId)?.[eventName] ?? []
		if (!isDisplayedOnly(compId)) {
			return compActions
		}

		const compTemplateActions = compActionsStore.get(getFullId(compId))?.[eventName] ?? []
		return [...compActions, ...compTemplateActions]
	}
	// @ts-ignore
	const callback: EventPropFunction = (...args: Array<any>) => {
		if (navigationManager.isDuringNavigation() && !navigationManager.isFirstNavigation()) {
			return
		}

		const compActions = getCompActionHandlers()
		compActions.forEach((eventHandler) => eventHandler(...args))
	}
	callback[eventSymbol] = true

	return callback
}

export const CompEventsRegistrar = withDependencies(
	[CompActionsSym, Props, NavigationManagerSymbol],
	(
		compActionsStore: ICompActionsStore,
		props: IPropsStore,
		navigationManager: INavigationManager
	): ICompEventsRegistrar => {
		const subscribers: Subscribers = []

		compActionsStore.subscribeToChanges((partial) => {
			const componentProps = Object.entries(partial).reduce((acc, [compId, compEvents]) => {
				if (!compEvents) {
					// destoryPage flow
					return acc
				}

				const compProps = props.get(compId) || {}
				const actionProps = Object.keys(compEvents)
					// Filter only events that are either new or has event prop that was not created by the compEventsRegistrar
					.filter((eventName) => !compProps[eventName] || !isEventPropFunction(compProps[eventName]))
					.reduce(
						(newProps, eventName) => ({
							...newProps,
							[eventName]: createEventPropFunction(
								compActionsStore,
								eventName,
								compId,
								navigationManager
							),
						}),
						{}
					)

				return Object.keys(actionProps).length ? { ...acc, [compId]: actionProps } : acc
			}, {} as PropsMap)

			props.update(componentProps)
		})
		const updateCompActions = (compId: string, newActions: ActionProps) => {
			const currentActions = compActionsStore.get(compId) || {}
			const mergedActions = Object.entries(newActions).reduce((acc, [eventName, compAction]) => {
				const currentEventCompActions = currentActions[eventName] || []

				const action = {
					[eventName]: [...currentEventCompActions, compAction],
				}
				return { ...acc, ...action }
			}, {})

			compActionsStore.update({
				[compId]: {
					...currentActions,
					...mergedActions,
				},
			})

			subscribers.forEach((cb) => {
				cb(compId, newActions)
			})
		}

		const register: ICompEventsRegistrar['register'] = (compId, eventName, compAction) => {
			updateCompActions(compId, { [eventName]: compAction })
		}

		const subscribeToChanges: ICompEventsRegistrar['subscribeToChanges'] = (cb) => {
			subscribers.push(cb)
		}

		return {
			register,
			subscribeToChanges,
		}
	}
)
