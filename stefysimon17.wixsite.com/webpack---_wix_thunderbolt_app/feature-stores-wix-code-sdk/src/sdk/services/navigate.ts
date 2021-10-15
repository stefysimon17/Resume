import { STORES_APP_DEF_ID, WixStoresNavigateSdkInteraction } from '../constants'
import { WixStoresServiceSdk } from '../WixStoresServiceSdk'

export class NavigateServiceSdk extends WixStoresServiceSdk {
	toCart(): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresNavigateSdkInteraction.NAVIGATE_TO_CART)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			await api.navigate.toCart()
			this.fedopsLogger.interactionEnded(WixStoresNavigateSdkInteraction.NAVIGATE_TO_CART)
		})
	}
}
