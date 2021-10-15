import { withDependencies } from '@wix/thunderbolt-ioc'
import { SdkHandlersProvider } from '@wix/thunderbolt-symbols'
import { IUrlChangeHandler } from 'feature-router'
import type { PlatformUrlManagerSdkHandlers } from './types'

export const platformUrlManager = withDependencies([], (): SdkHandlersProvider<PlatformUrlManagerSdkHandlers> & IUrlChangeHandler => {
	const onChangeHandlers: Array<Function> = []

	return {
		getSdkHandlers() {
			return {
				registerLocationOnChangeHandler(handler: Function) {
					onChangeHandlers.push(handler)
				},
			}
		},
		async onUrlChange(url) {
			onChangeHandlers.forEach((handler) => handler(url.href))
		},
	}
})
