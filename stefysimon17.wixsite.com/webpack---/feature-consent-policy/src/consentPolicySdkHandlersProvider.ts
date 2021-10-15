import { withDependencies } from '@wix/thunderbolt-ioc'
import { IPageDidMountHandler, SdkHandlersProvider } from '@wix/thunderbolt-symbols'
import { ConsentPolicy } from '@wix/cookie-consent-policy-client'
import { ConsentPolicySymbol } from './symbols'
import { ConsentPolicySdkHandlers, ConsentPolicyUpdatesListener, IConsentPolicy } from './types'

const consentPolicySdkHandlersFactory = (
	consentPolicyApi: IConsentPolicy
): SdkHandlersProvider<ConsentPolicySdkHandlers> & IPageDidMountHandler => {
	const sdkListeners: Array<ConsentPolicyUpdatesListener> = []
	const consentUpdatesListener: ConsentPolicyUpdatesListener = (policyDetails, policyHeaderObject) => {
		sdkListeners.forEach((listener) => listener(policyDetails, policyHeaderObject))
	}

	return {
		pageDidMount() {
			const unregister = consentPolicyApi.registerToChanges(consentUpdatesListener)
			return () => unregister()
		},
		getSdkHandlers() {
			return {
				setConsentPolicy(policy: ConsentPolicy) {
					return consentPolicyApi.setConsentPolicy(policy)
				},
				resetConsentPolicy() {
					return consentPolicyApi.resetConsentPolicy()
				},
				registerToConsentPolicyUpdates(listener: ConsentPolicyUpdatesListener) {
					sdkListeners.push(listener)
				},
			}
		},
	}
}

export const ConsentPolicySdkHandlersProvider = withDependencies([ConsentPolicySymbol], consentPolicySdkHandlersFactory)
