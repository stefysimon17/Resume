import { withDependencies } from '@wix/thunderbolt-ioc'
import { SdkHandlersProvider } from '@wix/thunderbolt-symbols'
import { AuthenticationWixCodeSdkHandlers, ICaptchaDialog } from '../types'
import { CaptchaDialogApiSymbol } from '../symbols'

export const authenticationCodeSdkHandlersProvider = withDependencies(
	[CaptchaDialogApiSymbol],
	({
		openCaptchaDialog,
		withCaptchaChallengeHandler,
	}: ICaptchaDialog): SdkHandlersProvider<AuthenticationWixCodeSdkHandlers> => {
		return {
			getSdkHandlers: () => {
				return {
					openCaptchaDialog,
					withCaptchaChallengeHandler,
				}
			},
		}
	}
)
