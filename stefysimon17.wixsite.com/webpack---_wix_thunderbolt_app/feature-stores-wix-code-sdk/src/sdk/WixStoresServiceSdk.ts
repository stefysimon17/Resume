import { STORES_APP_DEF_ID } from './constants'
import { AppPublicApiUtils, SessionServiceAPI } from '@wix/thunderbolt-symbols'
import type { FedopsLogger } from '@wix/fe-essentials-viewer-platform/fedops'

export class WixStoresServiceSdk {
	constructor(
		protected sessionService: SessionServiceAPI,
		protected fedopsLogger: FedopsLogger,
		protected appsPublicApisUtils: AppPublicApiUtils
	) {}

	protected getInstanceFunc = () => this.sessionService.getInstance(STORES_APP_DEF_ID)

	protected getRequestHeaders = () => ({
		Authorization: this.getInstanceFunc(),
		Accept: 'application/json',
	})
}
