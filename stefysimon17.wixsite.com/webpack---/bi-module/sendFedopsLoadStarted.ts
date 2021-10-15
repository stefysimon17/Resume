import isBot from './isBot'
import sendBeacon from './sendBeacon'
import isSuspectedBot from './isSuspectedBot'
import isIFrame from './isIFrame'
import extractCookieData from './cachingData'

//	eslint-disable-next-line
;(function () {
	const { site, rollout, fleetConfig, requestUrl, isInSEO, frogOnUserDomain } = window.fedops.data
	const ish = isBot(window) || isIFrame() || isSuspectedBot() || isInSEO ? 1 : 0
	const { isCached, caching } = extractCookieData()
	const types = {
		WixSite: 1,
		UGC: 2,
		Template: 3,
	}
	const st = types[site.siteType] || 0
	const fedOpsAppName = site.isResponsive ? 'thunderbolt-responsive' : 'thunderbolt'
	const { isDACRollout, siteAssetsVersionsRollout } = rollout
	const is_dac_rollout = isDACRollout ? 1 : 0
	const is_sav_rollout = siteAssetsVersionsRollout ? 1 : 0
	const is_rollout = fleetConfig.code === 0 || fleetConfig.code === 1 ? fleetConfig.code : null
	const ts = Date.now() - window.initialTimestamps.initialTimestamp
	const tsn = Date.now() - window.initialTimestamps.initialRequestTimestamp
	const { visibilityState } = document
	const pageVisibilty = visibilityState
	const { fedops, addEventListener } = window
	fedops.apps = fedops.apps || {}
	fedops.apps[fedOpsAppName] = { startLoadTime: tsn }
	fedops.sessionId = site.sessionId
	fedops.vsi = uuidv4()
	fedops.is_cached = isCached
	fedops.phaseStarted = (phase: string) => {
		const duration = Date.now() - ts
		sendBI(28, `&name=${phase}&duration=${duration}`)
	}
	fedops.phaseEnded = (phase: string) => {
		const duration = Date.now() - ts
		sendBI(22, `&name=${phase}&duration=${duration}`)
	}

	let bfcache = false
	addEventListener(
		'pageshow',
		({ persisted }) => {
			if (persisted) {
				if (!bfcache) {
					bfcache = true
					fedops.is_cached = true
				}
			}
		},
		true
	)

	function sendBI(evid: number, extra = '') {
		if (requestUrl.includes('suppressbi=true')) {
			return
		}
		const url =
			(frogOnUserDomain ? site.externalBaseUrl.replace(/^https?:\/\//, '') + '/_frog' : '//frog.wix.com') +
			'/bolt-performance?src=72&evid=' +
			evid +
			'&appName=' +
			fedOpsAppName +
			'&is_rollout=' +
			is_rollout +
			'&is_sav_rollout=' +
			is_sav_rollout +
			'&is_dac_rollout=' +
			is_dac_rollout +
			'&dc=' +
			site.dc +
			'&is_cached=' +
			isCached +
			'&msid=' +
			site.metaSiteId +
			'&session_id=' +
			window.fedops.sessionId +
			'&ish=' +
			ish +
			'&vsi=' +
			window.fedops.vsi +
			'&caching=' +
			caching +
			(bfcache ? ',browser_cache' : '') +
			'&pv=' +
			pageVisibilty +
			'&v=' +
			window.thunderboltVersion +
			'&url=' +
			requestUrl +
			'&st=' +
			st +
			extra
		sendBeacon(url)
	}

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0,
				v = c === 'x' ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
	}

	/* We don't want to send BI in deprecation flow */
	if (window.__browser_deprecation__) {
		return
	}

	sendBI(21, `&ts=${ts}&tsn=${tsn}`)
})()
