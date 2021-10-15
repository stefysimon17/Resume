import type {
	ConsentPolicyManagerInterface,
	ConsentPolicy,
	PolicyDetails,
	PolicyHeaderObject,
} from '@wix/cookie-consent-policy-client'

export type ConsentPolicySiteConfig = {
	isWixSite: boolean
	siteConsentPolicy: ConsentPolicy
}

export type ConsentPolicyUpdatesListener = (
	policyDetails: PolicyDetails,
	policyHeaderObject: PolicyHeaderObject
) => void

export interface ConsentPolicyWixCodeApi {
	getCurrentConsentPolicy(): PolicyDetails
	_getConsentPolicyHeader(): PolicyHeaderObject
	setConsentPolicy(policy: ConsentPolicy): Promise<PolicyDetails>
	resetConsentPolicy(): Promise<void>
}

export interface IConsentPolicy extends ConsentPolicyWixCodeApi {
	registerToChanges(listener: ConsentPolicyUpdatesListener): Function
}

export interface ConsentPolicySdkHandlers extends Record<string, Function> {
	setConsentPolicy(policy: ConsentPolicy): Promise<PolicyDetails>
	resetConsentPolicy(): Promise<void>
	registerToConsentPolicyUpdates(listener: ConsentPolicyUpdatesListener): void
}

export enum ConsentPolicyInteraction {
	GET_CURRENT_CONSENT_POLICY = 'get-current-consent-policy',
	SET_CONSENT_POLICY = 'set-consent-policy',
	RESET_CONSENT_POLICY = 'reset-consent-policy',
	ON_CONSENT_POLICY_CHANGED = 'on-consent-policy-changed',
}

export type NonPromise<T> = T extends Promise<any> ? never : T

export interface ConsentPolicyLogger {
	executeAndLog<T>(action: () => NonPromise<T>, interaction: ConsentPolicyInteraction): T
	executeAndLogAsync<T>(action: () => Promise<T>, interaction: ConsentPolicyInteraction): Promise<T>
}

declare global {
	interface Window {
		consentPolicyManager?: ConsentPolicyManagerInterface
	}
}
