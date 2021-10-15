import { AppParams, PlatformEnvData, ViewerAppSpecData } from '@wix/thunderbolt-symbols'
import { BlocksPreviewAppDefId, WixCodeAppDefId } from '../constants'
import { RouterConfig } from '@wix/thunderbolt-ssr-api'

export function createAppParams({
	appSpecData,
	wixCodeViewerAppUtils,
	blocksPreviewAppUtils,
	dynamicRouteData,
	routerConfigMap,
	appInstance,
	baseUrls,
	viewerScriptUrl,
	blocksData,
}: {
	appSpecData: ViewerAppSpecData
	wixCodeViewerAppUtils: any
	blocksPreviewAppUtils: any
	dynamicRouteData?: PlatformEnvData['router']['dynamicRouteData']
	routerConfigMap: Array<RouterConfig> | null
	appInstance: string
	baseUrls: Record<string, string> | null | undefined
	viewerScriptUrl: string
	blocksData: unknown
}): AppParams {
	const createSpecificAppDataByApp: { [appDefId: string]: (appData: ViewerAppSpecData) => any } = {
		[WixCodeAppDefId]: wixCodeViewerAppUtils.createWixCodeAppData,
		[BlocksPreviewAppDefId]: blocksPreviewAppUtils.createBlocksPreviewAppData,
	}

	return {
		appInstanceId: appSpecData.appDefinitionId,
		appDefinitionId: appSpecData.appDefinitionId,
		appName: appSpecData.appDefinitionName || appSpecData.type || appSpecData.appDefinitionId,
		instanceId: appSpecData.instanceId,
		instance: appInstance,
		url: viewerScriptUrl,
		baseUrls,
		appData: createSpecificAppDataByApp[appSpecData.appDefinitionId] ? createSpecificAppDataByApp[appSpecData.appDefinitionId](appSpecData) : null,
		appRouters: routerConfigMap,
		routerReturnedData: dynamicRouteData?.pageData, // TODO deprecate this in favor of wixWindow.getRouterData()
		blocksData,
	}
}
