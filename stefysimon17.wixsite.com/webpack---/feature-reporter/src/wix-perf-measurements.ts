import { Experiments } from '@wix/thunderbolt-symbols'
import { BI_EVENTS_SPECS } from './constants'

const WPM_LABEL = 'wixPerformanceMeasurements'
const TIMEOUT = 10_000

interface ILoaded {
	entryType: string
	tti: number
	lcp?: number
	cls?: number
}
type WixPerformanceMeasurements = Array<Promise<ILoaded>>

declare global {
	interface Window {
		wixPerformanceMeasurements: WixPerformanceMeasurements
	}
	interface WindowEventMap {
		wixPerformanceMeasurements: CustomEvent<WixPerformanceMeasurements>
	}
}

export function wixPerformanceMeasurements(experiments: Experiments): Promise<ILoaded> {
	return new Promise((resolve, reject) => {
		if (!experiments[BI_EVENTS_SPECS.REPORT_PERF]) {
			reject()
		}

		const timeoutId = setTimeout(reject, TIMEOUT)

		{
			// For details see https://github.com/wix-private/wix-perf-measure#api
			const wpm = window![WPM_LABEL]
			if (wpm) {
				resolveMetrics(wpm)
			} else {
				window.addEventListener(WPM_LABEL, ({ detail }) => {
					resolveMetrics(detail)
				})
			}
		}

		function resolveMetrics(wpm: WixPerformanceMeasurements) {
			wpm.forEach((promise) =>
				promise.then((measurement) => {
					if (measurement.entryType === 'loaded') {
						clearTimeout(timeoutId)
						resolve(measurement)
					}
				})
			)
		}
	})
}
