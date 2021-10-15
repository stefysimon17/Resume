import fastdom from 'fastdom'
import { ViewerModel } from '@wix/thunderbolt-symbols'
import { instance as biService } from '../bi-module/instance'
import { applyPolyfillsIfNeeded } from './polyfills'
import { prefersReducedMotion } from '../lib/prefersReducedMotion'
// eslint-disable-next-line no-restricted-syntax
import mediaResizeMap from '@wix/santa-animations/src/mediaResizeMap'
import wixCustomElementsRegistry from '@wix/wix-custom-elements'

type CustomElementsMediaData = Pick<ViewerModel, 'experiments' | 'media' | 'requestUrl'>

const DEFINE_WIX_IMAGE_AFTER_FONTS_READY = 'specs.thunderbolt.define_wix_image_after_fonts_ready'
const initWixCustomElementsRegistry = () => {
	const resizeService = {
		init: (callback: any) => new ResizeObserver(callback),
	}

	const windowResizeService = {
		init: (callback: any) => window.addEventListener('resize', callback),
	}

	return wixCustomElementsRegistry.init({ resizeService, windowResizeService })
}

const buildCustomElementsMediaParams = (partialViewerModel: CustomElementsMediaData, wixCustomElements?: any) => {
	const getDevicePixelRatio = () => {
		const isMSMobileDevice = /iemobile/i.test(navigator.userAgent)
		if (isMSMobileDevice) {
			return Math.round(
				window.screen.availWidth / (window.screen.width || window.document.documentElement.clientWidth)
			)
		}
		return window.devicePixelRatio
	}

	const isExperimentOpen = (experiment: string) => Boolean(partialViewerModel.experiments[experiment])

	const getMediaDimensionsByEffect = (bgEffectName: string, width: number, height: number, screenHeight: number) => {
		const { getMediaDimensions, ...rest } = mediaResizeMap[bgEffectName] || {}
		return getMediaDimensions
			? { ...getMediaDimensions(width, height, screenHeight), ...rest }
			: { width, height, ...rest }
	}

	const environmentConsts = {
		staticMediaUrl: partialViewerModel.media.staticMediaUrl,
		mediaRootUrl: partialViewerModel.media.mediaRootUrl,
		experiments: {},
		isViewerMode: true,
		devicePixelRatio: getDevicePixelRatio(),
	}

	const services = {
		mutationService: fastdom,
		biService,
		isExperimentOpen,
	}
	const mediaServices = { getMediaDimensionsByEffect, ...services }

	return {
		...partialViewerModel,
		wixCustomElements: wixCustomElements || initWixCustomElementsRegistry(),
		services,
		environmentConsts,
		mediaServices,
	}
}

export const initCustomElements = (partialViewerModelParam: CustomElementsMediaData, wixCustomElementsParam?: any) => {
	const customElementsParamsPromise = applyPolyfillsIfNeeded().then(() =>
		buildCustomElementsMediaParams(partialViewerModelParam, wixCustomElementsParam)
	)
	const domInteractive = new Promise<void>((resolve) => {
		if (document.readyState === 'complete' || document.readyState === 'interactive') {
			resolve()
		} else {
			document.addEventListener('readystatechange', () => resolve(), { once: true })
		}
	})

	Promise.all([customElementsParamsPromise, domInteractive]).then(
		([{ services, environmentConsts, wixCustomElements, media, requestUrl, mediaServices, experiments }]) => {
			wixCustomElements.defineWixVideo(mediaServices, {
				...environmentConsts,
				staticVideoUrl: media.staticVideoUrl,
				prefersReducedMotion: prefersReducedMotion(window, requestUrl),
			})
			wixCustomElements.defineWixDropdownMenu(services, environmentConsts)
			wixCustomElements.defineWixIframe(services, environmentConsts)

			const defineImagesTrigger: Promise<void> = experiments[DEFINE_WIX_IMAGE_AFTER_FONTS_READY] // @ts-ignore
				? window.document.fonts.ready
				: Promise.resolve()

			defineImagesTrigger.then(() => {
				wixCustomElements.defineWixImage(mediaServices, environmentConsts)
				wixCustomElements.defineWixBgImage(mediaServices, environmentConsts)
				wixCustomElements.defineWixBgMedia(mediaServices, environmentConsts)
			})
		}
	)
	window.__imageClientApi__ = wixCustomElementsRegistry.imageClientApi
}
