import { withDependencies } from '@wix/thunderbolt-ioc'
import { CompProps, IPropsStore, Props } from '@wix/thunderbolt-symbols'

type PlatformOnPropsChangedHandler = (overrideProps: CompProps) => Promise<void>
export default withDependencies([Props], (propsStore: IPropsStore) => {
	const platformOnPropsChangedHandler: { [pageId: string]: (overrideProps: { [id: string]: any }) => void } = {}
	const platformPropsSyncPromises: Array<Promise<void>> = []

	const triggerPlatformPropsSync = (displayedId: string, overrideProps: CompProps) => {
		const pageId = propsStore.getContextIdOfCompId(displayedId)
		if (!pageId) {
			return
		}
		if (pageId === 'masterPage') {
			// update all models in the platform in case the component is on the master page since the platform always merges masterPage to the models.
			Object.values(platformOnPropsChangedHandler).forEach((handler) => handler({ [displayedId]: overrideProps }))
			return
		}
		if (platformOnPropsChangedHandler[pageId]) {
			platformOnPropsChangedHandler[pageId]({ [displayedId]: overrideProps })
		}
	}

	return {
		triggerPlatformPropsSync,
		waitForPlatformPropsSyncToApply() {
			return Promise.all(platformPropsSyncPromises).catch(console.error)
		},
		getSdkHandlers() {
			return {
				registerOnPropsChangedHandler(pageId: string, handler: PlatformOnPropsChangedHandler) {
					platformOnPropsChangedHandler[pageId] = (overrideProps) => {
						const propsSyncPromise = handler(overrideProps)
						platformPropsSyncPromises.push(propsSyncPromise)
					}
				},
			}
		},
	}
})
