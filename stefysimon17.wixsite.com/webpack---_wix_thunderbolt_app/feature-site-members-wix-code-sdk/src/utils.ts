import { AuthenticationWixCodeSdkWixCodeApi } from 'feature-authentication-wix-code-sdk'
import { WixCodeNamespacesRegistry } from '@wix/thunderbolt-symbols'

export const getWithCaptchaChallengeHandler = (wixCodeNamespacesRegistry: WixCodeNamespacesRegistry) => {
	const { withCaptchaChallengeHandler } = wixCodeNamespacesRegistry.get(
		'authentication'
	) as AuthenticationWixCodeSdkWixCodeApi
	return withCaptchaChallengeHandler
}
