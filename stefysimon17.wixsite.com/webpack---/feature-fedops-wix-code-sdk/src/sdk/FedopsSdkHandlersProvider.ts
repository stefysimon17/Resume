import { withDependencies } from '@wix/thunderbolt-ioc'
import { ILogger, LoggerSymbol, SdkHandlersProvider } from '@wix/thunderbolt-symbols'

export const FedopsSdkHandlersProvider = withDependencies(
	[LoggerSymbol],
	(logger: ILogger): SdkHandlersProvider => {
		return {
			getSdkHandlers: () => ({
				registerWidgets(widgetAppNames: Array<string>) {
					logger.registerPlatformWidgets(widgetAppNames)
				},
			}),
		}
	}
)
