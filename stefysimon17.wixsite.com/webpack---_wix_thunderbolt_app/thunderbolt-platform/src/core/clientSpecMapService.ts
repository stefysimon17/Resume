import _ from 'lodash'
import { ClientSpecMapAPI } from '@wix/thunderbolt-symbols'
import { logSdkError } from '@wix/thunderbolt-commons'
import { BootstrapData } from '../types'

export const DATA_BINDING_APP_DEF_ID = 'dataBinding'

export default function ({ bootstrapData }: { bootstrapData: BootstrapData }): ClientSpecMapAPI {
	const { appsSpecData, wixCodeBootstrapData, appsUrlData, blocksBootstrapData, widgetNames } = bootstrapData
	const wixCodeAppData = wixCodeBootstrapData.wixCodeAppDefinitionId && appsSpecData[wixCodeBootstrapData.wixCodeAppDefinitionId]

	return {
		getViewerScriptUrl(appDefinitionId) {
			return _.get(appsUrlData, [appDefinitionId, 'viewerScriptUrl'])
		},
		getControllerScript(appDefinitionId, widgetId) {
			return _.get(appsUrlData, [appDefinitionId, 'widgets', widgetId, 'controllerUrl'])
		},
		getAppSpecData(appDefinitionId) {
			return appsSpecData[appDefinitionId]
		},
		getAppWidgetNames(appDefinitionId) {
			return _.get(widgetNames, [appDefinitionId, 'widgets'], {})
		},
		isWixCodeInstalled() {
			return !!wixCodeAppData
		},
		getWixCodeAppDefinitionId() {
			return wixCodeBootstrapData.wixCodeAppDefinitionId
		},
		getDataBindingAppDefinitionId() {
			return DATA_BINDING_APP_DEF_ID
		},
		getBlocksAppsAppDefinitionIds() {
			return _.keys(blocksBootstrapData)
		},
		getBlocksData(appDefinitionId) {
			return blocksBootstrapData?.[appDefinitionId]
		},
		isAppOnSite(appDefinitionId) {
			return !!appsSpecData[appDefinitionId]
		},
		getAppsOnSite() {
			return _.keys(appsSpecData)
		},
		isWixTPA(appDefinitionId) {
			if (!appsSpecData[appDefinitionId]) {
				logSdkError(`App with appDefinitionId ${appDefinitionId} does not exist on the site`)
				return false
			}
			return !!appsSpecData[appDefinitionId].isWixTPA
		},
		isModuleFederated(appDefinitionId) {
			return !!appsSpecData[appDefinitionId].isModuleFederated
		},
	}
}
