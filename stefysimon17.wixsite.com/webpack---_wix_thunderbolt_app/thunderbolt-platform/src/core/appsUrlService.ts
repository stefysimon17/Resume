import _ from 'lodash'
import type { BootstrapData } from '../types'

export type AppsUrlAPI = {
	getViewerScriptUrl(appDefinitionId: string): string | null
	getControllerScriptUrl(appDefinitionId: string, widgetId: string): string | null | undefined
	getBaseUrls(appDefinitionId: string): Record<string, string> | undefined | null
}

export default function ({ bootstrapData }: { bootstrapData: BootstrapData }): AppsUrlAPI {
	const { appsUrlData } = bootstrapData

	return {
		getViewerScriptUrl(appDefinitionId: string) {
			const appData = appsUrlData[appDefinitionId]
			if (!appData) {
				return null
			}

			return appData.viewerScriptUrl
		},
		getControllerScriptUrl(appDefinitionId: string, widgetId: string) {
			const appData = appsUrlData[appDefinitionId]
			if (!appData || !appData.widgets) {
				return null
			}

			return _.get(appData.widgets[widgetId], 'controllerUrl')
		},
		getBaseUrls(appDefinitionId: string) {
			const appData = appsUrlData[appDefinitionId]
			if (!appData) {
				return null
			}

			return appData.baseUrls
		},
	}
}
