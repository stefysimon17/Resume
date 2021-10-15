import { ConsentPolicyChangedHandler, ConsentPolicyManager, PlatformEnvData } from '@wix/thunderbolt-symbols'
import { ConsentPolicy, PolicyDetails, PolicyHeaderObject } from '@wix/cookie-consent-policy-client'
import { ConsentPolicySdkHandlers } from 'feature-consent-policy'

export function CreateConsentPolicyManager({ handlers, platformEnvData }: { handlers: ConsentPolicySdkHandlers; platformEnvData: PlatformEnvData }): ConsentPolicyManager {
	let { details: consentPolicyDetails, header: consentPolicyHeaderObject } = platformEnvData.consentPolicy

	const clonePolicyDetails = (policyDetails: PolicyDetails) => ({
		...policyDetails,
		policy: {
			...policyDetails.policy,
		},
	})

	const clonePolicyHeaderObject = (policyHeaderObject: PolicyHeaderObject) => ({
		...policyHeaderObject,
	})

	const consentPolicyChangedHandlers: Array<ConsentPolicyChangedHandler> = []

	if (process.env.browser) {
		handlers.registerToConsentPolicyUpdates((policyDetails: PolicyDetails, policyHeaderObject: PolicyHeaderObject) => {
			consentPolicyDetails = policyDetails
			consentPolicyHeaderObject = policyHeaderObject
			consentPolicyChangedHandlers.forEach((handler) => handler(clonePolicyDetails(policyDetails)))
		})
	}

	return {
		getDetails() {
			return clonePolicyDetails(consentPolicyDetails)
		},
		getHeader() {
			return clonePolicyHeaderObject(consentPolicyHeaderObject)
		},
		setPolicy(policy: ConsentPolicy) {
			return handlers.setConsentPolicy(policy)
		},
		resetPolicy() {
			return handlers.resetConsentPolicy()
		},
		onChanged(handler: ConsentPolicyChangedHandler) {
			consentPolicyChangedHandlers.push(handler)
		},
	}
}
