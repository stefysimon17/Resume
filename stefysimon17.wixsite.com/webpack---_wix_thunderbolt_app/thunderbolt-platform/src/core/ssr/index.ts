import _ from 'lodash'
import type { PlatformEnvData, ModelsAPI } from '@wix/thunderbolt-symbols'

export const SsrCacheHintsManager = ({ platformEnvData, modelsApi, handlers }: { platformEnvData: PlatformEnvData; modelsApi: ModelsAPI; handlers: { setSsrCacheHints: Function } }) => {
	return {
		setSsrCacheHints: () => {
			if (!process.env.browser && platformEnvData.bi.pageData.pageNumber === 1) {
				const platformControllersOnPage = _.mapValues(modelsApi.getApplications(), (controllers) => _.map(controllers, 'controllerType'))
				handlers.setSsrCacheHints({ platformControllersOnPage })
			}
		},
	}
}
