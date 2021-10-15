// @ts-nocheck
export const applyPolyfillsIfNeeded = () =>
	Promise.all([
		!('customElements' in window) &&
			import('@webcomponents/custom-elements' /* webpackChunkName: "custom-elements-polyfill" */),
		!('IntersectionObserver' in window) &&
			import('intersection-observer' /* webpackChunkName: "intersection-observer-polyfill" */),
		!('ResizeObserver' in window) &&
			import('@wix/wix-resize-observer-polyfill' /* webpackChunkName: "wix-resize-observer-polyfill" */).then(
				(ResizeObserverPolyfill) => (window.ResizeObserver = ResizeObserverPolyfill.default)
			),
	])
