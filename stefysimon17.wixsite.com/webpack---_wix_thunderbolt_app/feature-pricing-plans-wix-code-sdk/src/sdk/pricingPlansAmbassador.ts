import { loadAmbassadorMemberOrdersHttp, loadAmbassadorMembershipApiHttp } from './dynamicImports'

interface ApiLocation {
	protocol: string
	hostname: string
	pricingPlansBasePath: string
}

export class PricingPlansAmbassador {
	constructor(private readonly apiLocation: ApiLocation, private readonly getInstanceHeader: () => string) {}

	checkoutService = async () => {
		const artifact = (await loadAmbassadorMembershipApiHttp()).MembershipApi(this.getBaseUrl())
		return artifact.CheckoutService()(this.getRequestHeaders())
	}

	memberOrdersService = async () => {
		const artifact = (await loadAmbassadorMemberOrdersHttp()).PricingPlansMemberOrders(this.getBaseUrl())
		return artifact.MemberOrdersService()(this.getRequestHeaders())
	}

	private getBaseUrl = () => {
		return `${this.apiLocation.protocol}//${this.apiLocation.hostname}${this.apiLocation.pricingPlansBasePath}`
	}

	private getRequestHeaders = () => ({
		Authorization: this.getInstanceHeader(),
		Accept: 'application/json',
	})
}
