import _ from 'lodash'
import { CommonConfig, PlatformLogger, SessionServiceAPI, WixCodeBootstrapData, Experiments } from '@wix/thunderbolt-symbols'
import { WixCodeAppDefId } from './constants'

declare let self: DedicatedWorkerGlobalScope & { elementorySupport: any }

export function elementorySupportScriptUrlFor(wixCodeBootstrapData: WixCodeBootstrapData, wixDataAsNamespace: boolean) {
	const script = wixDataAsNamespace ? 'elementory-browser-support.min.js' : 'wixCodeNamespacesAndElementorySupport.min.js'
	return `${wixCodeBootstrapData.wixCodePlatformBaseUrl}/${script}`
}

const createElementorySupportQueryParams = ({ codeAppId, wixCodeInstance, viewMode }: { codeAppId: string; wixCodeInstance: string; viewMode: string }) =>
	`?gridAppId=${codeAppId}&instance=${wixCodeInstance}&viewMode=${viewMode}`

export async function importAndInitElementorySupport({
	importScripts,
	wixCodeBootstrapData,
	sessionService,
	viewMode,
	csrfToken,
	commonConfig,
	logger,
	experiments,
}: {
	importScripts: any
	wixCodeBootstrapData: WixCodeBootstrapData
	sessionService: SessionServiceAPI
	viewMode: string
	csrfToken: string
	commonConfig: CommonConfig
	logger: PlatformLogger
	experiments: Experiments
}) {
	const wixDataAsNamespace = Boolean(experiments['specs.thunderbolt.WixDataNamespace'])

	if (!self.elementorySupport) {
		try {
			await logger.runAsyncAndReport(`import_scripts_wixCodeNamespacesAndElementorySupport`, async () => {
				const elementorySupportScriptUrl = elementorySupportScriptUrlFor(wixCodeBootstrapData, wixDataAsNamespace)
				try {
					await importScripts(elementorySupportScriptUrl)
				} catch {
					await importScripts(elementorySupportScriptUrl) // retry
				}
			})
		} catch {}
	}

	if (!self.elementorySupport) {
		const error = new Error('could not load elementorySupport')
		logger.captureError(error, { tags: { elementorySupportImport: true }, extra: { elementorySupportScriptUrl: elementorySupportScriptUrlFor(wixCodeBootstrapData, wixDataAsNamespace) } })
		return
	}

	const options = { headers: { 'X-XSRF-TOKEN': csrfToken, commonConfig: JSON.stringify(commonConfig) } }
	self.elementorySupport.baseUrl = wixCodeBootstrapData.elementorySupport.baseUrl
	self.elementorySupport.options = _.assign({}, self.elementorySupport.options, options)
	if (wixCodeBootstrapData.wixCodeModel) {
		self.elementorySupport.queryParameters = createElementorySupportQueryParams({
			codeAppId: wixCodeBootstrapData.wixCodeModel.appData.codeAppId,
			viewMode,
			wixCodeInstance: sessionService.getWixCodeInstance(),
		})
		sessionService.onInstanceChanged(({ instance: wixCodeInstance }) => {
			self.elementorySupport.queryParameters = createElementorySupportQueryParams({
				codeAppId: wixCodeBootstrapData.wixCodeModel.appData.codeAppId,
				viewMode,
				wixCodeInstance,
			})
		}, WixCodeAppDefId)
	}
}
