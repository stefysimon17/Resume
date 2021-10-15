import _ from 'lodash'
import type { ComponentSdkFactory } from '@wix/thunderbolt-platform-types'
import type { ModelsAPI } from '@wix/thunderbolt-symbols'
import type { WixSelector } from '../wixSelector'

export function DocumentSdkFactory({ wixSelector, modelsApi }: { wixSelector: WixSelector; modelsApi: ModelsAPI }): ComponentSdkFactory {
	const findCompId = (compType: string) => _.findKey(modelsApi.getStructureModel(), { componentType: compType })

	return ({ controllerCompId }) => ({
		get type() {
			return '$w.Document'
		},
		get children() {
			return ['Page', 'HeaderContainer', 'FooterContainer'].map((compType) => {
				const compId = findCompId(compType) as string
				return wixSelector.getInstance({ controllerCompId, compId, compType, role: 'Document' })
			})
		},
		get background() {
			const compType = 'PageBackground'
			const compId = findCompId(compType) as string
			return wixSelector.getInstance({ controllerCompId, compId, compType, role: 'Document' }).background
		},
		toJSON() {
			return {} // implemented bolt behavior to fix TB-2911
		},
	})
}
