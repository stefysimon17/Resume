import { ViewerModel, WixBiSession } from '@wix/thunderbolt-symbols'
import isBot from './isBot'
import isSuspectedBot from './isSuspectedBot'
import isIFrame from './isIFrame'
import extractCookieData from './cachingData'

const SITE_TYPES: Record<ViewerModel['site']['siteType'], WixBiSession['st']> = {
	WixSite: 1,
	UGC: 2,
	Template: 3,
}

const isInSEO = ({ seo }: { [key: string]: any }) => (seo?.isInSEO ? 'seo' : '')

export default (): WixBiSession => {
	const {
		fedops,
		viewerModel: { siteFeaturesConfigs, requestUrl, site, fleetConfig, requestId, commonConfig },
	} = window

	const btype = isBot(window) || isIFrame() || isSuspectedBot() || isInSEO(siteFeaturesConfigs)

	return {
		suppressbi: requestUrl.includes('suppressbi=true'),
		initialTimestamp: window.initialTimestamps.initialTimestamp,
		initialRequestTimestamp: window.initialTimestamps.initialRequestTimestamp,
		viewerSessionId: fedops.vsi,
		siteRevision: String(site.siteRevision),
		msId: site.metaSiteId,
		is_rollout: fleetConfig.code === 0 || fleetConfig.code === 1 ? fleetConfig.code : null,
		is_platform_loaded: 0,
		requestId,
		requestUrl: encodeURIComponent(requestUrl),
		sessionId: String(site.sessionId),
		btype,
		isjp: !!btype,
		dc: site.dc,
		siteCacheRevision: '__siteCacheRevision__',
		checkVisibility: (() => {
			let alwaysVisible = true

			function checkVisibility() {
				alwaysVisible = alwaysVisible && document.hidden !== true
			}

			document.addEventListener('visibilitychange', checkVisibility, { passive: true })
			checkVisibility()
			return () => {
				checkVisibility()
				return alwaysVisible
			}
		})(),
		...extractCookieData(),
		isMesh: 1,
		isServerSide: 0,
		st: SITE_TYPES[site.siteType] || 0,
		commonConfig,
	}
}
