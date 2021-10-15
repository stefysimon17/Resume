import { loadAmbassadorWixEcomCartServicesWebHttp, loadCartMapper } from '../dynamicImports'
import { CART_API_BASE_URL, STORES_APP_DEF_ID, WixStoresCartSdkInteraction } from '../constants'
import { WixStoresServiceSdk } from '../WixStoresServiceSdk'

export class CartServiceSdk extends WixStoresServiceSdk {
	async getCurrentCart(): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.GET_CURRENT_CART)
		const { WixEcommerceCartServicesWeb } = await loadAmbassadorWixEcomCartServicesWebHttp()
		const { cartMapperClient } = await loadCartMapper()

		const cartApiFactory = WixEcommerceCartServicesWeb(CART_API_BASE_URL).Carts()
		const cartApi = cartApiFactory(this.getRequestHeaders())

		const res = await cartApi.getCurrentCart({})
		this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.GET_CURRENT_CART)
		return cartMapperClient(res.cart as any, this.getInstanceFunc)
	}

	onChange(handler: (cart: any) => void) {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.ON_CART_CHANGED)
		this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then((api: any) => {
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.ON_CART_CHANGED)
			// @ts-ignore
			api.registerOnCartChangeListener(() => {
				this.getCurrentCart().then((cart) => handler(cart))
			})
		})
	}

	removeProduct(cartItemId: number): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.REMOVE_PRODUCT_FROM_CART)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			// @ts-ignore
			await api.removeProductFromCart(cartItemId)
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.REMOVE_PRODUCT_FROM_CART)
			return this.getCurrentCart()
		})
	}

	addCustomItems(customItems: Array<any>): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.ADD_CUSTOM_ITEMS_TO_CART)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			await api.addCustomItemsToCart(customItems)
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.ADD_CUSTOM_ITEMS_TO_CART)
			return this.getCurrentCart()
		})
	}

	applyCoupon(couponCode: string): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.APPLY_COUPON)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			await api.applyCouponToCart(couponCode)
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.APPLY_COUPON)
			return this.getCurrentCart()
		})
	}

	removeCoupon(): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.REMOVE_COUPON)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			await api.removeCouponFromCart()
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.REMOVE_COUPON)
			return this.getCurrentCart()
		})
	}

	updateLineItemQuantity(cartItemId: number, quantity: number): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.UPDATE_LINE_ITEM_QUANTITY)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			await api.updateLineItemQuantityInCart(cartItemId, quantity)
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.UPDATE_LINE_ITEM_QUANTITY)
			return this.getCurrentCart()
		})
	}

	addProducts(products: Array<any>): Promise<any> {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.ADD_PRODUCTS_TO_CART)
		return this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			await api.addProductsToCart(products)
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.ADD_PRODUCTS_TO_CART)
			return this.getCurrentCart()
		})
	}

	showMiniCart(): void {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.SHOW_MINI_CART)
		this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then((api: any) => {
			api.showMinicart()
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.SHOW_MINI_CART)
		})
	}

	hideMiniCart(): void {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.HIDE_MINI_CART)
		this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then((api: any) => {
			api.hideMinicart()
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.HIDE_MINI_CART)
		})
	}

	reload(): void {
		this.fedopsLogger.interactionStarted(WixStoresCartSdkInteraction.RELOAD)
		this.appsPublicApisUtils.getPublicAPI(STORES_APP_DEF_ID).then(async (api: any) => {
			api.cart.reloadCart()
			this.fedopsLogger.interactionEnded(WixStoresCartSdkInteraction.RELOAD)
		})
	}
}
