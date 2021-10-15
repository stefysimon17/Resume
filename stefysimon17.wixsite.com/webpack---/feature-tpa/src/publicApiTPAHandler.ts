import { named, optional, withDependencies } from '@wix/thunderbolt-ioc'
import {
	PlatformWorkerPromise,
	PlatformWorkerPromiseSym,
	SdkHandlersProvider,
	PublicAPI,
	TpaHandlerProvider,
	FeatureStateSymbol,
	IPageWillUnmountHandler,
	ViewerModel,
	ViewerModelSym,
	LoggerSymbol,
	ILogger,
} from '@wix/thunderbolt-symbols'
import { loadPmRpc } from '@wix/thunderbolt-commons'
import { IFeatureState } from 'thunderbolt-feature-state'
import { name } from './symbols'

type TpaState = {
	publicApiTPAHandlerState: {
		alreadyInvoked: boolean
		resolvePublicApiGetter: Function
		waitForAppsToRegister: Promise<Function>
	}
}

export const PublicApiTPAHandler = withDependencies(
	[named(FeatureStateSymbol, name), optional(PlatformWorkerPromiseSym), ViewerModelSym, LoggerSymbol],
	(
		featureState: IFeatureState<TpaState>,
		platformWorkerPromiseObj: {
			platformWorkerPromise: PlatformWorkerPromise
		},
		{ siteAssets, mode: { debug } }: ViewerModel,
		logger: ILogger
	): TpaHandlerProvider & SdkHandlersProvider<any> & IPageWillUnmountHandler => {
		if (!featureState.get()?.publicApiTPAHandlerState) {
			const alreadyInvoked = false
			let resolvePublicApiGetter: Function
			const waitForAppsToRegister: Promise<Function> = new Promise((res) => {
				resolvePublicApiGetter = res
			})
			featureState.update(() => ({
				...featureState.get(),
				publicApiTPAHandlerState: {
					alreadyInvoked,
					resolvePublicApiGetter,
					waitForAppsToRegister,
				},
			}))
		}
		return {
			pageWillUnmount() {
				featureState.update(() => ({
					...featureState.get(),
					// @ts-ignore
					publicApiTPAHandlerState: null,
				}))
			},
			getTpaHandlers() {
				return {
					waitForWixCodeWorkerToBeReady: async () => {
						if (debug) {
							console.warn(
								'getPublicApi() has high performance overhead as we download and execute all apps on site. consider mitigating this by e.g migrating to Wix Blocks or OOI.'
							)
						}
						if (featureState.get().publicApiTPAHandlerState.alreadyInvoked) {
							return {}
						}

						const [pmRpc, worker, getPublicApiNames] = (await Promise.all([
							loadPmRpc(siteAssets.clientTopology.moduleRepoUrl),
							platformWorkerPromiseObj.platformWorkerPromise,
							featureState.get().publicApiTPAHandlerState.waitForAppsToRegister,
						])) as Array<any>
						const appsPublicApisNames = await getPublicApiNames()

						if (!appsPublicApisNames.length) {
							const errorMessage = 'getPublicApi() rejected since there are no platform apps on page'
							if (debug) {
								console.warn(errorMessage)
							}
							throw new Error(errorMessage)
						}

						await Promise.all(
							appsPublicApisNames.map((appName: string) =>
								pmRpc.api.request(appName, { target: worker }).then((publicAPI: PublicAPI) => {
									pmRpc.api.set(appName, publicAPI)
								})
							)
						)
						featureState.update(() => ({
							...featureState.get(),
							publicApiTPAHandlerState: {
								...featureState.get().publicApiTPAHandlerState,
								alreadyInvoked: true,
							},
						}))

						return {}
					},
				}
			},
			getSdkHandlers: () => ({
				registerPublicApiGetter: (appsPublicApisGetter: Function) => {
					if (featureState.get().publicApiTPAHandlerState) {
						featureState.get().publicApiTPAHandlerState.resolvePublicApiGetter(appsPublicApisGetter)
					} else {
						logger.captureError(new Error('resolvePublicApiGetter is not a function'), {
							tags: {
								resolvePublicApiGetter: true,
							},
						})
					}
				},
			}),
		}
	}
)
