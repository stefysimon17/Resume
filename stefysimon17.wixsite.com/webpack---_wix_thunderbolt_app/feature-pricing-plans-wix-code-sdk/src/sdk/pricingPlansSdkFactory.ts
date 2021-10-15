import { WixCodeApiFactoryArgs } from '@wix/thunderbolt-symbols'
import { namespace, PricingPlansWixCodeSdkWixCodeApi } from '..'
import { API_BASE_PATH, APP_DEF_ID } from './constants'
import { validateGuid } from './validation'
import { PricingPlansAmbassador } from './pricingPlansAmbassador'
import { CancellationEffectiveAtEnum, PricingPlansApi } from './pricingPlansApi'

export function PricingPlansSdkFactory({
	platformUtils,
}: WixCodeApiFactoryArgs): {
	[namespace]: PricingPlansWixCodeSdkWixCodeApi
} {
	const { locationManager, sessionService, wixCodeNamespacesRegistry } = platformUtils

	const getInstanceHeader = () => sessionService.getInstance(APP_DEF_ID)

	const url = locationManager.getLocation()
	const apiLocation = {
		protocol: url.protocol,
		hostname: url.hostname,
		pricingPlansBasePath: API_BASE_PATH,
	}

	const ppAmbassador = new PricingPlansAmbassador(apiLocation, getInstanceHeader)
	const api = new PricingPlansApi(ppAmbassador)

	async function ensureMemberIsLoggedIn() {
		const siteMembers = wixCodeNamespacesRegistry.get('user')
		if (!siteMembers.currentUser.loggedIn) {
			await siteMembers.promptLogin()
		}
	}

	const pricingPlansSdk: PricingPlansWixCodeSdkWixCodeApi = {
		checkout: {
			async createOnlineOrder(planId: string, startDate?: Date) {
				validateGuid(planId)
				await ensureMemberIsLoggedIn()

				return api.startOnlineOrder(planId, startDate)
			},

			async startOnlinePurchase(planId: string, startDate?: Date) {
				validateGuid(planId)
				await ensureMemberIsLoggedIn()

				const wixPay = wixCodeNamespacesRegistry.get('pay')

				const order = await api.startOnlineOrder(planId, startDate)

				if (!order.wixPayOrderId) {
					return { order }
				}

				const { status: wixPayStatus } = await wixPay.startPayment(order.wixPayOrderId, {
					showThankYouPage: true,
				})

				return {
					order,
					wixPayStatus,
				}
			},
		},

		orders: {
			async listCurrentMemberOrders(limit?: number, skip?: number) {
				await ensureMemberIsLoggedIn()
				return api.listCurrentMemberOrders({ limit, offset: skip })
			},

			async requestCurrentMemberOrderCancellation(
				orderId: string,
				cancellationEffectiveAt: CancellationEffectiveAtEnum
			) {
				validateGuid(orderId)
				await ensureMemberIsLoggedIn()

				await api.requestMemberOrderCancellation(orderId, cancellationEffectiveAt)
			},
		},
	}

	return {
		[namespace]: pricingPlansSdk,
	}
}
