import Context from './AppContext'
import _ from 'lodash'
import { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { ActionProps, CompProps } from '@wix/thunderbolt-symbols'

const useControllerActions = (displayedId: string, compType: string, compProps: CompProps) => {
	const { createCompControllerArgs, compControllers } = useContext(Context)
	const controllerActions = useMemo(() => compControllers[compType](createCompControllerArgs(displayedId)), [
		displayedId,
		compType,
		compControllers,
		createCompControllerArgs,
	])

	const compOwnActions: ActionProps = useMemo(() => {
		return Object.keys(controllerActions).reduce(
			(acc, actionName) => (compProps[actionName] ? { ...acc, [actionName]: compProps[actionName] } : acc),
			{}
		)
	}, [controllerActions, compProps])

	const mergedControllerActions = useMemo(() => {
		return Object.entries(compOwnActions).reduce((acc, [actionName, action]) => {
			return {
				...acc,
				[actionName]: (...args: Array<any>) => {
					controllerActions[actionName](...args)
					action(...args)
				},
			}
		}, {})
	}, [compOwnActions, controllerActions])

	return { ...compProps, ...controllerActions, ...mergedControllerActions }
}

const useDisplayedProps = (displayedId: string, compProps: CompProps) => {
	const functionPropsRef = useRef({} as CompProps)
	const fixedFunctionPropsRef = useRef({} as CompProps)

	const fixedFunctionProps = Object.entries(compProps).reduce((acc, [propName, propValue]) => {
		if (typeof propValue === 'function') {
			if (propValue !== functionPropsRef.current[propName]) {
				functionPropsRef.current[propName] = propValue
				fixedFunctionPropsRef.current[propName] = (event: any, ...rest: Array<any>) => {
					if (event?.nativeEvent && event.nativeEvent instanceof Event) {
						const clonedEvent = _.clone(event)
						clonedEvent.compId = displayedId
						return propValue(clonedEvent, ...rest)
					}
					return propValue(event, ...rest)
				}
			}
			return { ...acc, [propName]: fixedFunctionPropsRef.current[propName] }
		}
		return acc
	}, {} as ActionProps)

	return { ...compProps, ...fixedFunctionProps }
}

export const useProps = (displayedId: string, compId: string, compType: string) => {
	const { props: propsStore, compControllers } = useContext(Context)
	const compProps =
		displayedId !== compId ? { ...propsStore.get(compId), ...propsStore.get(displayedId) } : propsStore.get(compId)

	const propsWithControllerActions = compControllers[compType]
		? // eslint-disable-next-line react-hooks/rules-of-hooks
		  useControllerActions(displayedId, compType, compProps)
		: compProps

	return displayedId !== compId
		? // eslint-disable-next-line react-hooks/rules-of-hooks
		  useDisplayedProps(displayedId, propsWithControllerActions)
		: propsWithControllerActions
}

export const useStoresObserver = (id: string, displayedId: string): void => {
	const { structure: structureStore, props: propsStore, compsLifeCycle } = useContext(Context)

	const [, setTick] = useState(0)
	const forceUpdate = useCallback(() => setTick((tick) => tick + 1), [])

	const subscribeToStores = () => {
		compsLifeCycle.notifyCompDidMount(id, displayedId) // we call it when the id\displayed id changes although it's not mount
		const stores = [propsStore, structureStore]
		const unSubscribers: Array<() => void> = []
		stores.forEach((store) => {
			const unsubscribe = store.subscribeById(displayedId, forceUpdate)
			unSubscribers.push(unsubscribe)
			if (displayedId !== id) {
				forceUpdate() // sync repeated component props with stores props in case stores props were updated during first render
				unSubscribers.push(store.subscribeById(id, forceUpdate))
			}
		})

		return () => {
			unSubscribers.forEach((cb) => cb())
		}
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(subscribeToStores, [id, displayedId])
}
