import { WixCodeApiFactoryArgs } from '@wix/thunderbolt-symbols'
import { namespace, DashboardWixCodeSdkHandlers, DashboardWixCodeSdkWixCodeApi } from '..'
import { dashboardApiFacadeFactory } from './services/dashboardApiFacadeFactory'
import { callDashboardApiFactory } from './services/callDashboardApiFactory'

export function DashboardSdkFactory({
	handlers,
}: WixCodeApiFactoryArgs<never, never, DashboardWixCodeSdkHandlers>): { [namespace]: DashboardWixCodeSdkWixCodeApi } {
	const { getDashboardApi } = handlers
	const callDashboardApi = callDashboardApiFactory(getDashboardApi)

	return {
		[namespace]: dashboardApiFacadeFactory(callDashboardApi),
	}
}
