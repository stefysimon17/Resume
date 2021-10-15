import { withDependencies, optional } from '@wix/thunderbolt-ioc'
import { AnimationCallbacks, Animations, IAnimations, Sequence } from 'feature-animations'
import type { IResolvableReadyForScrollPromise, IWindowScrollAPI } from './types'
import { calcScrollDuration } from './scrollUtils'
import { BrowserWindowSymbol, ViewMode, ViewModeSym } from '@wix/thunderbolt-symbols'
import { PopupUtilsSymbol, IPopupUtils } from 'feature-popups'
import { ResolvableReadyForScrollPromiseSymbol } from './symbols'
import { ISiteScrollBlocker, SiteScrollBlockerSymbol } from 'feature-site-scroll-blocker'

const isElementOrAncestorFixed = (element: HTMLElement) => {
	let elem = element
	while (elem && elem !== window.document.body) {
		if (window.getComputedStyle(elem).getPropertyValue('position').toLowerCase() === 'fixed') {
			return true
		}
		elem = elem.offsetParent as HTMLElement
	}
	return false
}

const pxToNumber = (pxSize: string) => Number(pxSize.replace('px', ''))

const getCompClientYForScroll = (window: Window, compNode: HTMLElement, isScrollBlocked: boolean) => {
	const wixAdsElement = window.document.getElementById('WIX_ADS')
	const wixAdsHeight = wixAdsElement ? wixAdsElement.offsetHeight : 0

	const siteHeaderPlaceholderElement = window.document.getElementById('SITE_HEADER-placeholder')
	const siteHeaderPlaceholderHeight = siteHeaderPlaceholderElement ? siteHeaderPlaceholderElement.offsetHeight : 0

	let bodyTop = window.document.body.getBoundingClientRect().top

	const compTop = compNode.getBoundingClientRect().top

	if (isScrollBlocked) {
		const siteContainerElement = window.document.getElementById('SITE_CONTAINER')
		bodyTop = siteContainerElement ? pxToNumber(window.getComputedStyle(siteContainerElement).marginTop) : 0
	}

	return compTop - bodyTop - wixAdsHeight - siteHeaderPlaceholderHeight
}

const getScrollableElement = (popupUtils?: IPopupUtils) =>
	popupUtils?.getCurrentPopupId() ? window.document.getElementById('POPUPS_ROOT')! : window

export const WindowScroll = withDependencies(
	[
		BrowserWindowSymbol,
		ViewModeSym,
		ResolvableReadyForScrollPromiseSymbol,
		SiteScrollBlockerSymbol,
		optional(PopupUtilsSymbol),
		optional(Animations),
	],
	(
		window: Window,
		viewMode: ViewMode,
		{ readyForScrollPromise }: IResolvableReadyForScrollPromise,
		siteScrollBlockerApi: ISiteScrollBlocker,
		popupUtils?: IPopupUtils,
		animations?: IAnimations
	): IWindowScrollAPI => {
		const animatedScrollTo = async (targetY: number, callbacks: AnimationCallbacks = {}): Promise<void> => {
			if (!animations) {
				return
			}
			const animationInstance = await animations.getInstance()
			await readyForScrollPromise
			const isMobile = viewMode === 'mobile'
			const easingName = isMobile ? 'Quint.easeOut' : 'Sine.easeInOut'
			const duration = calcScrollDuration(window.pageYOffset, targetY, isMobile)
			const scrollableElement = getScrollableElement(popupUtils)

			return new Promise((resolve) => {
				const mergedCallbacks = {
					...callbacks,
					onComplete: (instance: Sequence) => {
						callbacks.onComplete?.(instance)
						resolve()
					},
				}
				animationInstance.runAnimationOnElements('BaseScroll', [scrollableElement], duration, 0, {
					y: targetY,
					ease: easingName,
					callbacks: mergedCallbacks,
				})
			})
		}

		const scrollToComponent = async (
			targetCompId: string,
			{ callbacks = {}, skipScrollAnimation = false } = {}
		) => {
			await readyForScrollPromise
			const targetElement = window.document.getElementById(targetCompId)!
			if (!targetElement || (isElementOrAncestorFixed(targetElement) && !popupUtils?.getCurrentPopupId())) {
				return
			}
			const compClientYForScroll = getCompClientYForScroll(
				window,
				targetElement,
				siteScrollBlockerApi.isScrollingBlocked()
			)
			if (skipScrollAnimation) {
				window.scrollTo({ top: 0 })
			} else {
				await animatedScrollTo(compClientYForScroll, callbacks)
			}
			targetElement.focus()
		}

		return {
			animatedScrollTo,
			scrollToComponent,
		}
	}
)
