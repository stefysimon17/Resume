import _ from 'lodash'
import { BootstrapData } from '../types'
import { AppSpecData } from '@wix/thunderbolt-symbols'

export interface BlocksPreviewAppData {
	blocksPreviewData: {
		widgetsCodeMap: {
			[pageId: string]: {
				url: string
			}
		}
		widgetDescriptorsMap: { [widgetType: string]: object }
	}
}

export interface BlocksPreviewAppUtils {
	createBlocksPreviewAppData(appData: AppSpecData): BlocksPreviewAppData
}

export default function ({ bootstrapData }: { bootstrapData: BootstrapData }) {
	const {
		wixCodeBootstrapData: { wixCodePageIds },
		platformEnvData,
	} = bootstrapData
	return {
		createBlocksPreviewAppData(): BlocksPreviewAppData {
			return {
				blocksPreviewData: {
					widgetsCodeMap: _.mapValues(wixCodePageIds, (url) => ({ url })),
					widgetDescriptorsMap: platformEnvData.blocks?.blocksPreviewData?.widgetDescriptorsMap ?? {},
				},
			}
		},
	}
}
