import _ from 'lodash'
import { BootstrapData } from '../types'
import type { EventHandlers } from './types'
import { AppSpecData } from '@wix/thunderbolt-symbols'
import { MasterPageId } from './constants'
import { StaticEventsManager } from './staticEventsManager'

export interface WixCodeViewerAppUtils {
	createWixCodeAppData(
		appData: AppSpecData
	): {
		userCodeMap: Array<{
			url: string
			displayName: string
			id: string
			scriptName: string
		}>
	}
	setStaticEventHandlers(eventHandlers: EventHandlers): void
}

export default function ({ bootstrapData, staticEventsManager }: { bootstrapData: BootstrapData; staticEventsManager: StaticEventsManager }) {
	const {
		wixCodeBootstrapData: { wixCodePageIds, wixCodeModel, codePackagesData },
		platformEnvData,
		currentPageId,
	} = bootstrapData
	const {
		bi: { pageData },
		site: { pageIdToTitle },
	} = platformEnvData

	const pagesToRunUserCodeOn = pageData.isLightbox ? [currentPageId] : [MasterPageId, currentPageId]

	return {
		createWixCodeAppData() {
			const codeAppId = _.get(wixCodeModel, 'appData.codeAppId')

			return {
				userCodeMap: pagesToRunUserCodeOn
					.filter((pageId) => wixCodePageIds[pageId])
					.map((pageId: string) => ({
						url: wixCodePageIds[pageId],
						displayName: pageId === MasterPageId ? 'site' : `${pageIdToTitle[pageId]} page`,
						id: pageId,
						scriptName: `${pageId}.js`,
					})),
				shouldUseGlobalsObject: true,
				codeAppId,
				codePackagesData,
			}
		},
		setStaticEventHandlers: async (eventHandlers: EventHandlers) => {
			staticEventsManager.setStaticEventsCallbacks(eventHandlers)
		},
	}
}
