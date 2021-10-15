import 'proxy-polyfill'
import { proxy, wrap, createEndpoint } from 'comlink/dist/esm/comlink.js' // eslint-disable-line no-restricted-syntax
import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	AppDidMountPromiseSymbol,
	BrowserWindow,
	BrowserWindowSymbol,
	IAppWillRenderFirstPageHandler,
	IComponentsStylesOverrides,
	IPropsStore,
	Props,
	ComponentsStylesOverridesSymbol,
} from '@wix/thunderbolt-symbols'
import { IWarmupDataProvider, WarmupDataProviderSymbol } from 'feature-warmup-data'
import { BootstrapData, InitPlatformOnSiteArgs, PlatformInitializer, PlatformWarmupData, ViewerAPI } from '../types'
import { platformWorkerPromise } from './create-worker'
import { PlatformClientWorkerAPI } from '../core/types'

export default withDependencies<PlatformInitializer>(
	[WarmupDataProviderSymbol, AppDidMountPromiseSymbol, Props, BrowserWindowSymbol, ComponentsStylesOverridesSymbol],
	(
		warmupDataProvider: IWarmupDataProvider,
		appDidMountPromise: Promise<unknown>,
		propsStore: IPropsStore,
		window: BrowserWindow,
		componentsStylesOverrides: IComponentsStylesOverrides
	): PlatformInitializer & IAppWillRenderFirstPageHandler => ({
		async initPlatformOnSite(initArgs: InitPlatformOnSiteArgs) {
			const worker = (await platformWorkerPromise) as Worker
			const { initPlatformOnSite }: PlatformClientWorkerAPI = wrap(worker)
			initPlatformOnSite(initArgs)
		},
		async runPlatformOnPage(bootstrapData: BootstrapData, viewerAPI: ViewerAPI) {
			const worker = (await platformWorkerPromise) as Worker
			const workerProxy = wrap(worker)
			const workerMessagePort = await workerProxy[createEndpoint]()
			// prevent malicious "self.onmessage =" user code from sniffing messages upon navigation, specifically platformEnvData.site.applicationsInstances.
			const workerSecureProxy: PlatformClientWorkerAPI = wrap(workerMessagePort)
			return workerSecureProxy.runPlatformOnPage(bootstrapData, proxy(viewerAPI.updateProps), proxy(viewerAPI.invokeSdkHandler), proxy(viewerAPI.updateStyles))
		},
		async updateProps(partialProps) {
			const platformWarmupData = await warmupDataProvider.getWarmupData<PlatformWarmupData>('platform')
			if (platformWarmupData /* TODO && !preview */) {
				// queue props to be flushed after hydration. function props are not queued cause they're set via the registerEvent() viewer api.
				// ooi props are not queued cause they're set via the setControllerProps() viewer api.
				await appDidMountPromise
			}
			propsStore.update(partialProps)
		},
		async updateStyles(styleData) {
			const platformWarmupData = await warmupDataProvider.getWarmupData<PlatformWarmupData>('platform')
			if (platformWarmupData /* TODO && !preview */) {
				// queue styles to be flushed after hydration.
				await appDidMountPromise
			}
			componentsStylesOverrides.set(styleData as {})
		},
		async appWillRenderFirstPage() {
			// update props store with props from warmup data before hydrating
			const platformWarmupData = await warmupDataProvider.getWarmupData<PlatformWarmupData>('platform')
			platformWarmupData?.ssrPropsUpdates.forEach(propsStore.update) // eslint-disable-line no-unused-expressions
			platformWarmupData?.ssrStyleUpdates.forEach(componentsStylesOverrides.set) // eslint-disable-line no-unused-expressions
		},
	})
)
