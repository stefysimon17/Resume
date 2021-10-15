import { withDependencies } from '@wix/thunderbolt-ioc'
import { BusinessLogger, BusinessLoggerSymbol, ILinkClickHandler } from '@wix/thunderbolt-symbols'

// eslint-disable-next-line no-restricted-syntax
import { isMailtoUrl, isPhoneUrl, isWhatsappLink } from '@wix/thunderbolt-commons/src/platform/linkPatternUtils'

export const ReportBiClickHandlerFactory = (businessLogger: BusinessLogger): ILinkClickHandler => {
	const sendBi = (clickType: string) => {
		businessLogger.logger.log(
			{
				src: 76,
				evid: 1112,
				clickType,
			},
			{ endpoint: 'pa' }
		)
	}
	return {
		handleClick: (anchorTarget: HTMLElement) => {
			const href = anchorTarget.getAttribute('href') || ''

			if (isPhoneUrl(href)) {
				sendBi('phone-clicked')
			}
			if (isMailtoUrl(href)) {
				sendBi('email-clicked')
			}
			if (isWhatsappLink(href)) {
				sendBi('whatsapp-clicked')
			}
			return false
		},
	}
}

export const ReportBiClickHandler = withDependencies([BusinessLoggerSymbol], ReportBiClickHandlerFactory)
