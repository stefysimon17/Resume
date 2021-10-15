import _ from 'lodash'
import { getFullId, getItemId } from '@wix/thunderbolt-commons'
import type { SdkInstance, ModelsAPI } from '@wix/thunderbolt-symbols'
import { EVENT_CONTEXT_SCOPE } from './constants'
import { componentSdkFactoryArgs } from '@wix/thunderbolt-platform-types'
import { getRepeaterScopeContext } from './repeaterUtils'

export type IRegisterEventFactory = {
	createRegisterEvent(compId: string, getSdkInstance: (_compId?: string) => SdkInstance): componentSdkFactoryArgs['registerEvent']
	getCreateEventFunction(getSdkInstance: (_compId?: string) => SdkInstance): componentSdkFactoryArgs['createEvent']
}

export function RegisterEventFactory({ handlers, modelsApi }: { handlers: any; modelsApi: ModelsAPI }): IRegisterEventFactory {
	function getEventContext(compId: string) {
		const repeaterCompId = modelsApi.getRepeaterIdByCompId(getFullId(compId))
		if (repeaterCompId) {
			return getRepeaterScopeContext(repeaterCompId, getItemId(compId))
		}

		return { type: EVENT_CONTEXT_SCOPE.GLOBAL_SCOPE }
	}

	function getCreateEventFunction(getSdkInstance: (_compId?: string) => any) {
		return function createEvent(e: any) {
			if (!_.isObject(e)) {
				// there are case when sdk register events on the components and trigger them programmatically
				return e
			}

			const { compId, ...restEvent } = e as any
			const target = compId ? getSdkInstance(compId) : getSdkInstance() // compId will only be there if the event is fired on a repeated item
			const context = getEventContext(compId || target.uniqueId)
			return {
				...restEvent,
				target,
				context,
				compId: compId || target.uniqueId, // TODO: remove after EE finish migration of using createCorvidEvent
			}
		}
	}

	function createRegisterEvent(compId: string, getSdkInstance: (_compId?: string) => SdkInstance) {
		const createEventFunction = getCreateEventFunction(getSdkInstance)
		return function registerEvent<EventHandler extends Function = Function>(eventName: string, eventHandler: EventHandler) {
			handlers.registerEvent(compId, eventName, ([event, ...rest]: Array<any> = [{}]) => {
				eventHandler(createEventFunction(event), ...rest)
			})
		}
	}

	return {
		getCreateEventFunction,
		createRegisterEvent,
	}
}
