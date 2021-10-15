import _ from 'lodash'
import { createStyleUtils, getFullId, getItemId } from '@wix/thunderbolt-commons'
import type { PlatformUtils, SdkInstance, PlatformLogger, Connection, $W, PlatformEnvData, $WScope, EventContext, ModelsAPI } from '@wix/thunderbolt-symbols'
import type { componentSdkFactoryArgs } from '@wix/thunderbolt-platform-types'
import type { ViewerAPI } from '../types'
import type { IPlatformAnimationsAPI, RunAnimationOptions } from '../animations-types'
import type { CreateSetProps } from './setPropsFactory'
import type { InstanceCacheFactory } from './instanceCache'
import type { ComponentSdkStateFactory } from './componentSdkState'
import type { WixSelector } from './wixSelector'
import type { IRegisterEventFactory } from './createRegisterEvent'
import { MasterPageId } from './constants'

export type SdkFactoryParams = {
	getSdkFactoryParams(args: {
		compId: string
		controllerCompId: string
		connection?: Connection
		compType: string
		role: string
		getInstance: WixSelector['getInstance']
		create$w: () => $W
		$wScope: $WScope
	}): componentSdkFactoryArgs
}

export default function ({
	modelsApi,
	viewerAPI,
	getCompRefById,
	platformUtils,
	createSdkHandlers,
	createSetProps,
	sdkInstancesCache,
	componentSdkState,
	registerEventFactory,
	animationsApi,
	platformEnvData,
}: {
	modelsApi: ModelsAPI
	viewerAPI: ViewerAPI
	getCompRefById: (compId: string) => any
	platformUtils: PlatformUtils
	createSdkHandlers: (pageId: string) => any
	logger: PlatformLogger
	createSetProps: CreateSetProps
	sdkInstancesCache: InstanceCacheFactory
	componentSdkState: ComponentSdkStateFactory
	registerEventFactory: IRegisterEventFactory
	animationsApi: IPlatformAnimationsAPI
	platformEnvData: PlatformEnvData
}): SdkFactoryParams {
	return {
		getSdkFactoryParams: ({ compId, connection, compType, controllerCompId, role, getInstance, create$w, $wScope }) => {
			const props = modelsApi.getCompProps(compId)
			const sdkData = modelsApi.getCompSdkData(compId)
			const handlers = createSdkHandlers(modelsApi.getPageIdByCompId(compId))

			const portalId = `portal-${compId}`

			const { hiddenOnLoad, collapseOnLoad } = modelsApi.getOnLoadProperties(compId)

			function getChildren() {
				return modelsApi.getContainerChildrenIds(compId).map((id: string) =>
					getInstance({
						controllerCompId,
						compId: id,
						compType: modelsApi.getCompType(id) || '',
						role: modelsApi.getRoleForCompId(id, controllerCompId) || '',
						connection: _.get(modelsApi.getCompIdConnections(), [id, controllerCompId]),
					})
				)
			}

			function getSdkInstance() {
				return sdkInstancesCache.getSdkInstance({ compId: getFullId(compId), controllerCompId, role, itemId: getItemId(compId) })
			}

			const isGlobal = () => {
				if (modelsApi.getCompType(compId) === 'Page') {
					return true // Page components are always global by design
				}
				return modelsApi.getPageIdByCompId(compId) === MasterPageId
			}

			function getParent(): SdkInstance | null {
				const parentId = modelsApi.findClosestParentIdWithRole(compId, controllerCompId)
				if (!parentId) {
					return
				}
				const parentCompType = modelsApi.getCompType(parentId)
				const parentRole = modelsApi.getRoleForCompId(parentId, controllerCompId) as string
				const parentConnection = modelsApi.getConnectionsByCompId(controllerCompId, parentRole)[0]
				return getInstance({ controllerCompId, compId: parentId, compType: parentCompType as string, role: parentRole, connection: parentConnection })
			}

			const getOwnSdkInstance = (_compId: string = compId) => getInstance({ controllerCompId, compType, connection, role, compId: _compId })
			const registerEvent = registerEventFactory.createRegisterEvent(compId, getOwnSdkInstance)
			const createEvent = registerEventFactory.getCreateEventFunction(getOwnSdkInstance)

			function setStyles(id: string, style: object) {
				if (modelsApi.isRepeaterTemplate(id)) {
					modelsApi.getDisplayedIdsOfRepeaterTemplate(id).forEach((displayedId: string) => {
						viewerAPI.updateStyles({ [displayedId]: style })
					})
				}
				viewerAPI.updateStyles({ [id]: style })
			}

			function createScoped$w({ context }: { context?: EventContext } = {}) {
				const $w = create$w()
				return context ? $w.at(context) : $w
			}

			const wixCodeId = modelsApi.getRoleForCompId(compId, 'wixCode')

			const styleUtils = createStyleUtils({ isResponsive: platformEnvData.site.isResponsive })

			return {
				props,
				sdkData,
				compId,
				controllerCompId,
				setStyles: (style: object) => {
					setStyles(compId, style)
				},
				setProps: createSetProps(compId),
				createSdkState: componentSdkState.createSdkState(compId),
				compRef: getCompRefById(compId),
				handlers,
				getChildren,
				registerEvent,
				createEvent,
				getSdkInstance,
				role,
				runAnimation: (options: Omit<RunAnimationOptions, 'compId'>) => animationsApi.runAnimation({ ...options, compId }),
				create$w: createScoped$w,
				$wScope,
				metaData: {
					compId,
					role,
					connection,
					compType,
					isGlobal,
					hiddenOnLoad,
					collapsedOnLoad: collapseOnLoad,
					isRendered: () => modelsApi.isRendered(compId),
					getParent,
					getChildren,
					wixCodeId,
					isRepeaterTemplate: modelsApi.isRepeaterTemplate(compId),
				},
				portal: {
					setStyles: (style: object) => {
						setStyles(portalId, style)
					},
					runAnimation: (options: Omit<RunAnimationOptions, 'compId'>) => animationsApi.runAnimation({ ...options, compId: portalId }),
				},
				envData: { location: { externalBaseUrl: platformEnvData.location.externalBaseUrl } },
				// eventually will remove the spread after migrating in EE, since we want SDKs to use platformUtils just like namespaces
				platformUtils,
				...platformUtils,
				styleUtils,
			}
		},
	}
}
