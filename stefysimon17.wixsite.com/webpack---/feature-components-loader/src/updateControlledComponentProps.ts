import {
	IPropsStore,
	Props,
	BusinessLogger,
	BusinessLoggerSymbol,
	ReporterSymbol,
	IReporterApi,
	IPlatformPropsSyncManager,
	PlatformPropsSyncManagerSymbol,
	Structure,
	IStructureStore,
} from '@wix/thunderbolt-symbols'
import { withDependencies, optional } from '@wix/thunderbolt-ioc'
import type { CreateCompControllerArgs } from './types'
import { getFullId } from '@wix/thunderbolt-commons'

export const controlledComponentFactory = withDependencies(
	[Props, Structure, PlatformPropsSyncManagerSymbol, optional(BusinessLoggerSymbol), optional(ReporterSymbol)],
	(
		propsStore: IPropsStore,
		structureStore: IStructureStore,
		platformPropsSyncManager: IPlatformPropsSyncManager,
		businessLogger: BusinessLogger,
		reporter?: IReporterApi
	) => {
		const createCompControllerArgs: CreateCompControllerArgs = (displayedId: string) => {
			const initialContextId = structureStore.getContextIdOfCompId(getFullId(displayedId))

			return {
				...(reporter && { trackEvent: reporter.trackEvent }),
				// @ts-ignore
				reportBi: (params, ctx) => {
					// @ts-ignore
					return businessLogger.logger.log(params, ctx)
				},
				updateProps: (overrideProps) => {
					// Ignore invokations from handlers that were created on other pages
					const currentContextId = structureStore.getContextIdOfCompId(getFullId(displayedId))

					if (!structureStore.get(getFullId(displayedId)) || initialContextId !== currentContextId) {
						return
					}

					propsStore.update({ [displayedId]: overrideProps })
					platformPropsSyncManager.triggerPlatformPropsSync(displayedId, overrideProps)
				},
			}
		}

		return {
			extendRendererProps() {
				return {
					createCompControllerArgs,
				}
			},
		}
	}
)
