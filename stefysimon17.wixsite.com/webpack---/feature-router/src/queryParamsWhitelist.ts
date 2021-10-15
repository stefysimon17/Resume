/**
 * Similar to the editor, -override is regarded as an internal query param - it should build the links with these params
 */
export const overrideSuffix = '-override'
/*
 * The Viewer doesn't preserve query params on internal navigation.
 * THIS LIST IS FOR INTERNAL QUERY PARAM ONLY!
 * Don't add query params here to support any kind of product.
 * If a product needs query params to persist after navigation - it should build the links with these params,
 * */
export const queryParamsWhitelist = new Set([
	'currency',
	'metaSiteId',
	'isqa',
	'experiments',
	'experimentsoff',
	'suppressbi',
	'sampleratio',
	'hot',
	'viewerPlatformAppSources',
	'wixCodeForceKibanaReport',
	'controllersUrlOverride',
	'debug',
	'petri_ovr',
	'iswixsite',
	'showMobileView',
	'lang',
	'ssrDebug',
	'wixAdsOverlay',
	'ssrIndicator',
	'siteRevision',
	'branchId',
	'forceThunderbolt',
	'widgetsUrlOverride',
	'viewerPlatformOverrides',
	'overridePlatformBaseUrls',
	'thunderboltTag',
	'tpasUrlOverride',
	'tpasWorkerUrlOverride',
	'disableHtmlEmbeds',
	'suricateTunnelId',
	'inBizMgr',
	'viewerSource',
	'dsOrigin',
	'disableSiteAssetsCache',
	'isEditor',
	'isSantaEditor',
	'disableAutoSave',
	'autosaveRestore',
	'isEdited',
	'ds',
	'ooiInEditorOverrides',
	'localIframeWorker',
	'productionWorker',
	'siteAssetsFallback',
])
