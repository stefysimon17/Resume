import { optional, withDependencies } from '@wix/thunderbolt-ioc'
import { ComponentsStylesOverridesSymbol, CompsLifeCycleSym, IAppWillLoadPageHandler, IComponentsStylesOverrides, ICompsLifeCycle } from '@wix/thunderbolt-symbols'
import { IPopupUtils, PopupUtilsSymbol } from 'feature-popups'
import { INavigationManager, NavigationManagerSymbol } from 'feature-navigation-manager'

export type PlatformViewPortAPI = {
	onViewportEnter(compId: string, cb: Function): void
	onViewportLeave(compId: string, cb: Function): void
} & IAppWillLoadPageHandler

const getIntersectionObserverOptions = () => {
	if (process.env.browser) {
		const wixAds = window!.document.getElementById('WIX_ADS')

		if (wixAds) {
			return { rootMargin: `-${wixAds.offsetHeight}px 0px 0px 0px` }
		}
	}
	return {}
}

export const platformViewportAPI = withDependencies(
	[ComponentsStylesOverridesSymbol, CompsLifeCycleSym, NavigationManagerSymbol, optional(PopupUtilsSymbol)],
	(componentsStylesOverrides: IComponentsStylesOverrides, compsLifeCycle: ICompsLifeCycle, navigationManager: INavigationManager, popupUtils?: IPopupUtils): PlatformViewPortAPI => {
		const intersectionObservers: Array<IntersectionObserver> = []
		let options: object

		const getAllTargets = (compId: string) => document.querySelectorAll(`#${compId}, [id^="${compId}__"]`) // supporting repeaters
		const getTargets = async (compId: string) => {
			if (navigationManager.isDuringNavigation()) {
				await navigationManager.waitForNavigationEnd()
			}
			const targets = getAllTargets(compId)
			if (targets.length) {
				return targets
			}
			await compsLifeCycle.waitForComponentToRender(compId)
			return getAllTargets(compId)
		}

		function registerViewportEnter({ target, cb, displayedId }: { target: Element; cb: Function; displayedId: string }) {
			options = options || getIntersectionObserverOptions()
			const onViewportEnterHandler = (entries: Array<IntersectionObserverEntry>) => {
				entries
					.filter((intersectionEntry) => intersectionEntry.target.id === displayedId)
					.forEach((intersectionEntry) => {
						const isIntersecting = intersectionEntry.isIntersecting
						const isHidden = componentsStylesOverrides.isHidden(displayedId)
						if (isIntersecting && !isHidden) {
							cb([{ type: 'viewportEnter', compId: displayedId }])
						}
					})
			}
			const intersectionObserver = new window.IntersectionObserver(onViewportEnterHandler, options)
			intersectionObservers.push(intersectionObserver)
			intersectionObserver.observe(target as HTMLElement)
		}

		function registerViewportLeave({ target, cb, displayedId }: { target: Element; cb: Function; displayedId: string }) {
			options = options || getIntersectionObserverOptions()
			let isFirstCall = true
			const onViewportLeaveHandler = (entries: Array<IntersectionObserverEntry>) => {
				entries
					.filter((intersectionEntry) => intersectionEntry.target.id === displayedId)
					.forEach((intersectionEntry) => {
						const isIntersecting = intersectionEntry.isIntersecting
						const isHidden = componentsStylesOverrides.isHidden(displayedId)
						if (!isIntersecting && !isHidden && !isFirstCall) {
							cb([{ type: 'viewportLeave', compId: displayedId }])
						}
						isFirstCall = false
					})
			}
			const intersectionObserver = new window.IntersectionObserver(onViewportLeaveHandler, options)
			intersectionObservers.push(intersectionObserver)
			intersectionObserver.observe(target as HTMLElement)
		}

		async function onViewportEnter(compId: string, cb: Function) {
			if (process.env.browser) {
				const targets = await getTargets(compId)
				targets.forEach((target) => registerViewportEnter({ target, cb, displayedId: target.id }))
			}
		}
		async function onViewportLeave(compId: string, cb: Function) {
			if (process.env.browser) {
				const targets = await getTargets(compId)
				targets.forEach((target) => registerViewportLeave({ target, cb, displayedId: target.id }))
			}
		}

		const appWillLoadPage: IAppWillLoadPageHandler['appWillLoadPage'] = ({ pageId }) => {
			// TODO what about popups? if i open the same popup couple times i'll have duplicate observers no? consider binding to the page container.
			if (!popupUtils?.isPopupPage(pageId)) {
				intersectionObservers.forEach((intersectionObserver) => intersectionObserver.disconnect())
				intersectionObservers.length = 0
			}
		}

		return {
			onViewportEnter,
			onViewportLeave,
			appWillLoadPage,
		}
	}
)
