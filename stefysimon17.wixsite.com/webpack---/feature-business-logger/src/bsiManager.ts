import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { ConsentPolicySymbol, IConsentPolicy } from 'feature-consent-policy'
import { CommonConfigSymbol, ICommonConfig } from 'feature-common-config'
import { MasterBsiManager } from '@wix/bsi-manager/dist/src/manager-master' // eslint-disable-line no-restricted-syntax
import type { IBsiManager, Manager, PageNumberState } from './types'
import { FeatureStateSymbol } from '@wix/thunderbolt-symbols'
import { name } from './symbols'
import { IFeatureState } from 'thunderbolt-feature-state'

const generateGuid = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
		const i = (16 * Math.random()) | 0
		return ('x' === e ? i : (3 & i) | 8).toString(16)
	})

const bsiManagerFactory = (
	featureState: IFeatureState<PageNumberState>,
	consentPolicy: IConsentPolicy,
	commonConfig: ICommonConfig
): IBsiManager => {
	const isSSR = !process.env.browser
	let bsiManager: Manager
	if (!isSSR) {
		bsiManager = new MasterBsiManager().init({
			genGuid: generateGuid,
			getCommonConfig: () => ({
				get: (key: 'bsi') => commonConfig.getCommonConfig()[key],
				set: (property, value) => commonConfig.updateCommonConfig({ [property]: value }),
			}),
		})
	} else {
		// Mock for SSR
		bsiManager = { getBsi: () => '' }
	}

	const getBsi = () => {
		const pageNumber = featureState.get()?.pageNumber || 1
		return bsiManager.getBsi(pageNumber)
	}

	return {
		getBsi,
		reportActivity: getBsi,
	}
}

export const BsiManager = withDependencies(
	[named(FeatureStateSymbol, name), ConsentPolicySymbol, CommonConfigSymbol],
	bsiManagerFactory
)
