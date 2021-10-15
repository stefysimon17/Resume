import BaseEmitter from 'tiny-emitter'
import { ControllerEventsAPI } from '@wix/thunderbolt-symbols'

export type IControllerEvents = {
	createScopedControllerEvents: (controllerId: string) => ControllerEventsAPI
}

export function ControllerEvents() {
	// @ts-ignore
	const emitter = new BaseEmitter()
	const scopeEvent = (controllerId: string, event: string) => `${controllerId}_${event}`
	function createScopedControllerEvents(controllerId: string): ControllerEventsAPI {
		return {
			on(event: string, callback: Function, context: any) {
				const scopedEvent = scopeEvent(controllerId, event)
				emitter.on(scopedEvent, callback, context)
				return () => emitter.off(scopedEvent, callback)
			},

			once(event: string, callback: Function, context: any) {
				const scopedEvent = scopeEvent(controllerId, event)
				emitter.once(scopedEvent, callback, context)
				return () => emitter.off(scopedEvent, callback)
			},

			off(event: string, callback: Function) {
				emitter.off(scopeEvent(controllerId, event), callback)
			},

			fireEvent(event: string, ...args: any) {
				emitter.emit(scopeEvent(controllerId, event), ...args)
			},
		}
	}
	return {
		createScopedControllerEvents,
	}
}
