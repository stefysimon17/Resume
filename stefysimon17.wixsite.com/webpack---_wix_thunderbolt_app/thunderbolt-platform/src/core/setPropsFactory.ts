import _ from 'lodash'
import type { ComponentEventContext, SetProps, SetControllerProps, PlatformLogger, ModelsAPI } from '@wix/thunderbolt-symbols'
import { getDisplayedId } from '@wix/thunderbolt-commons'
import type { ViewerAPI } from '../types'

const removeFunctions = (obj: object) => _.omitBy(obj, _.isFunction)
const extractFunctions = (obj: object) => _.pickBy(obj, _.isFunction)

function propsPartition(props: object, allowSecondLevelFunctions: boolean) {
	// first level
	const dataProps = removeFunctions(props)
	const functionProps = extractFunctions(props)
	// second level
	if (allowSecondLevelFunctions) {
		_.forEach(dataProps, (val, key) => {
			if (_.isObject(val) && !_.isArray(val)) {
				_.assign(
					functionProps,
					_.mapKeys(extractFunctions(val), (v, k) => `${key}.${k}`)
				)
				_.assign(dataProps, { [key]: removeFunctions(val) })
			} else {
				_.assign(dataProps, { [key]: val })
			}
		})
	}
	return { dataProps, functionProps }
}

export type CreateSetProps = (compId: string) => (partialProps: object | Promise<object>) => void
export type CreateSetPropsForOOI = (controllerCompId: string, context?: ComponentEventContext) => (partialProps: object) => void
export default function ({ modelsApi, viewerAPI, logger, handlers }: { modelsApi: ModelsAPI; viewerAPI: ViewerAPI; logger: PlatformLogger; handlers: { setControllerProps: SetControllerProps } }) {
	const updatePropsPromises: Array<Promise<any>> = []
	const waitForUpdatePropsPromises = () => logger.runAsyncAndReport('waitForUpdatePropsPromises', () => Promise.all(updatePropsPromises)).catch(_.noop)

	function updateProps(compId: string, resolvedProps: any) {
		modelsApi.updateProps(compId, resolvedProps)
		viewerAPI.updateProps({ [compId]: resolvedProps })
	}

	function createSetProps(compId: string): SetProps {
		return (partialProps: object | Promise<object>) => {
			const _setProps = (resolvedProps: object) => {
				updateProps(compId, resolvedProps)
				if (modelsApi.isRepeaterTemplate(compId)) {
					modelsApi.getDisplayedIdsOfRepeaterTemplate(compId).forEach((displayedId: string) => updateProps(displayedId, resolvedProps))
				}
			}
			if (partialProps instanceof Promise) {
				updatePropsPromises.push(partialProps.then(_setProps))
			} else {
				_setProps(partialProps)
			}
		}
	}

	function createSetPropsForOOI(controllerCompId: string, context?: ComponentEventContext) {
		return (partialProps: object) => {
			const { functionProps, dataProps } = propsPartition(partialProps, true)
			const compId = context ? getDisplayedId(controllerCompId, context.itemId) : controllerCompId
			handlers.setControllerProps(compId, dataProps, Object.keys(functionProps), (functionName, args) => functionProps[functionName](...args))
		}
	}

	return {
		createSetProps,
		createSetPropsForOOI,
		waitForUpdatePropsPromises,
	}
}
