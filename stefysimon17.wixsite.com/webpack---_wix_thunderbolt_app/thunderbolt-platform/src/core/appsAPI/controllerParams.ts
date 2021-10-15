import _ from 'lodash'
import type { Connections, ControllerDataAPI, AppParams, WixCodeApi, PlatformAPI, PlatformServicesAPI, WidgetNames, LivePreviewOptions } from '@wix/thunderbolt-symbols'
import type { WixSelector } from '../wixSelector'
import type { CreateSetPropsForOOI } from '../setPropsFactory'
import type { ViewerPlatformEssentials, AppEssentials } from '@wix/fe-essentials-viewer-platform'
import type { ControllerData } from '../types'

export function createControllersParams(
	createSetPropsForOOI: CreateSetPropsForOOI,
	controllersData: Array<ControllerData>,
	connections: Connections,
	wixSelector: WixSelector,
	widgetNames: WidgetNames,
	appParams: AppParams,
	wixCodeApi: WixCodeApi,
	platformAppServicesApi: PlatformServicesAPI,
	platformApi: PlatformAPI,
	csrfToken: string,
	essentials: ViewerPlatformEssentials,
	appEssentials: AppEssentials,
	livePreviewOptions?: Partial<LivePreviewOptions>
): Array<{ controllerCompId: string; controllerParams: ControllerDataAPI }> {
	return controllersData.map((controllerData) => {
		const { controllerType, compId, templateId, config, externalId, context } = controllerData
		return {
			controllerCompId: compId,
			controllerParams: {
				$w: context ? wixSelector.create$w(compId).at(context) : wixSelector.create$w(compId),
				compId: templateId || compId,
				name: widgetNames[controllerType] || controllerType,
				type: controllerType,
				config,
				connections: _.flatMap(connections[compId], _.values),
				warmupData: null,
				appParams,
				platformAPIs: Object.assign(platformApi, platformAppServicesApi),
				wixCodeApi,
				csrfToken,
				setProps: createSetPropsForOOI(compId, context),
				externalId,
				essentials: essentials.createControllerEssentials(
					{
						widgetId: controllerType,
					},
					appEssentials
				),
				livePreviewOptions,
			},
		}
	})
}
