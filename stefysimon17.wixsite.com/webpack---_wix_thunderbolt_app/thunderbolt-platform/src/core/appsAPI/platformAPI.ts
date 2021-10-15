import _ from 'lodash'
// @ts-ignore TODO remove all utils from platform APIs. let apps bundle their utils dependencies.
import { mediaItemUtils } from '@wix/santa-platform-utils'
import { PlatformAPI, PlatformEnvData, PlatformUtils } from '@wix/thunderbolt-symbols'
import { LinkData } from '@wix/thunderbolt-becky-types'
import { CreateWixStorageAPI } from '../../types'

const { types, parseMediaItemUri, createMediaItemUri } = mediaItemUtils

// BOLT: https://github.com/wix-private/bolt/blob/c83dc8f4b36f78e7b9c52eec63afdee045b34ecc/viewer-platform-worker/src/utils/platformUtilities.js#L5
export function createPlatformApi({
	platformEnvData,
	platformUtils,
	createStorageApi,
	handlers,
}: {
	platformEnvData: PlatformEnvData
	platformUtils: PlatformUtils
	createStorageApi: CreateWixStorageAPI
	handlers: any
}): (appDefinitionId: string, instanceId: string) => PlatformAPI {
	return (appDefinitionId: string, instanceId: string) => {
		const pubSub = process.env.browser
			? {
					subscribe: (eventKey: string, cb: Function, isPersistent: boolean) => {
						handlers.subscribe(appDefinitionId, eventKey, cb, isPersistent)
					},
					unsubscribe: (eventKey: string) => {
						handlers.unsubscribe(appDefinitionId, eventKey)
					},
					publish: (eventKey: string, data: any, isPersistent: boolean) => {
						handlers.publish(appDefinitionId, eventKey, data, isPersistent)
					},
			  }
			: {
					subscribe: _.noop,
					unsubscribe: _.noop,
					publish: _.noop,
			  }

		return {
			links: {
				toUrl: (linkObject: LinkData) => platformUtils.linkUtils.getLinkUrlFromDataItem(linkObject),
			},
			storage: createStorageApi(`${appDefinitionId}_${instanceId}`, handlers, platformEnvData.storage.storageInitData),
			pubSub,
			mediaItemUtils: {
				types,
				parseMediaItemUri,
				createMediaItemUri,
			},
		}
	}
}
