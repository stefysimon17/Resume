import {
	IAppWillLoadPageHandler,
	ILogger,
	IPageWillMountHandler,
	LifeCycle,
	LoggerSymbol,
} from '@wix/thunderbolt-symbols'
import { multi, withDependencies } from '@wix/thunderbolt-ioc'
import { taskify } from '@wix/thunderbolt-commons'
import { INavigationManager, NavigationManagerSymbol } from 'feature-navigation-manager'
import { PageProviderSymbol } from './symbols'
import { IPageInitializer, IPageProvider } from './types'

export const PageInitializer = withDependencies(
	[multi(LifeCycle.AppWillLoadPageHandler), PageProviderSymbol, LoggerSymbol, NavigationManagerSymbol],
	(
		appWillLoadPageHandlers: Array<IAppWillLoadPageHandler>,
		pageProvider: IPageProvider,
		logger: ILogger,
		navigationManager: INavigationManager
	): IPageInitializer => ({
		initPage: async ({ pageId, contextId }) => {
			logger.phaseStarted('init_page')
			const pageReflectorPromise = pageProvider(contextId, pageId)
			const pageWillMount = taskify(async () => {
				const pageReflector = await pageReflectorPromise
				const pageWillMountHandlers = pageReflector.getAllImplementersOf<IPageWillMountHandler>(
					LifeCycle.PageWillMountHandler
				)

				// TB-4458 upon navigation, we want to run all lifecycles that may change props synchronously so that we don't re-render components with partial props
				// TODO things work by chance. we should probably block react rendering during navigation.
				await Promise.all(
					navigationManager.isFirstNavigation()
						? pageWillMountHandlers.map((handler) => taskify(() => handler.pageWillMount(pageId)))
						: pageWillMountHandlers.map((handler) => handler.pageWillMount(pageId))
				)
			})

			await Promise.all([
				pageWillMount,
				...appWillLoadPageHandlers.map((handler) =>
					taskify(() => handler.appWillLoadPage({ pageId, contextId }))
				),
			])
			logger.phaseEnded('init_page')
		},
	})
)
