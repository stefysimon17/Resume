import _ from 'lodash'
import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	CompEventsRegistrarSym,
	CompRefAPI,
	CompRefAPISym,
	ICompEventsRegistrar,
	SdkHandlersProvider,
	PlatformViewportAPISym,
	IPlatformPropsSyncManager,
	PlatformPropsSyncManagerSymbol,
	AppDidMountPromiseSymbol,
} from '@wix/thunderbolt-symbols'
import { INavigationManager, NavigationManagerSymbol } from 'feature-navigation-manager'
import { PlatformViewPortAPI } from './viewportHandlers'

export const platformHandlersProvider = withDependencies(
	[CompRefAPISym, CompEventsRegistrarSym, PlatformViewportAPISym, PlatformPropsSyncManagerSymbol, AppDidMountPromiseSymbol, NavigationManagerSymbol],
	(
		compRefAPI: CompRefAPI,
		compEventsRegistrar: ICompEventsRegistrar,
		viewPortAPI: PlatformViewPortAPI,
		platformPropsSyncManager: IPlatformPropsSyncManager,
		appDidMountPromise: Promise<void>,
		navigationManager: INavigationManager
	): SdkHandlersProvider<any> => {
		function serializeEvent(args: any = []) {
			if (args[0] && args[0].nativeEvent instanceof Event) {
				const [event, ...rest] = args
				const originalNativeEvent = event.nativeEvent
				const serializedEvent = _.omitBy(event, _.isObject)
				serializedEvent.nativeEvent = _.omitBy(originalNativeEvent, _.isObject) // we need to keep the native event data because it is used in the event API
				return [serializedEvent, ...rest]
			}
			return args
		}

		return {
			getSdkHandlers() {
				return {
					invokeCompRefFunction: async (compId: string, functionName: string, args: any) => {
						if (navigationManager.isDuringNavigation()) {
							await navigationManager.waitForNavigationEnd()
						}
						const compRef: any = await compRefAPI.getCompRefById(compId)
						return compRef[functionName](...args)
					},
					registerEvent(compId: string, eventName: string, eventHandler: Function) {
						if (['onViewportLeave', 'onViewportEnter'].includes(eventName)) {
							viewPortAPI[eventName as 'onViewportLeave' | 'onViewportEnter'](compId, async (...args: any) => {
								await appDidMountPromise
								eventHandler(...args)
							})
							return
						}
						compEventsRegistrar.register(compId, eventName, async (...args: any) => {
							// we want to serialize the event before awaiting cause react has an optimization
							// that reuses synthetic events and invalidates them between tasks
							const serializedEvent = serializeEvent(args)
							// use case: comp sdk registers to onChange. controlled comp fires an onChange
							// we need to ensure that that props are synced in platform before invoking the onChange handler
							await platformPropsSyncManager.waitForPlatformPropsSyncToApply()
							eventHandler(serializedEvent)
						})
					},
				}
			},
		}
	}
)
