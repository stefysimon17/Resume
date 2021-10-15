import { BiStore, ViewerModel, WixBiSession, Experiments } from '@wix/thunderbolt-symbols'

const frogUrlOverride = (experiments: Experiments, externalBaseUrl: string) => {
	if (!process.env.browser) {
		return {}
	}
	return experiments['specs.thunderbolt.frog_on_user_domain'] ? { frogUrlOverride: externalBaseUrl } : {}
}

const getBiStore = (wixBiSession: WixBiSession, viewerModel: ViewerModel): BiStore => {
	const { rollout: rolloutData, site, experiments } = viewerModel

	const {
		msId: msid,
		viewerSessionId,
		requestId,
		initialTimestamp,
		initialRequestTimestamp,
		dc,
		is_rollout,
		isCached,
		checkVisibility,
		caching,
		isjp,
		btype,
		requestUrl,
		st,
	} = wixBiSession

	return {
		...frogUrlOverride(experiments, site.externalBaseUrl),
		session_id: site.sessionId,
		is_headless: isjp,
		is_headless_reason: btype,
		viewerSessionId: process.env.browser ? window.fedops.vsi : viewerSessionId,
		caching,
		checkVisibility,
		msid,
		requestId,
		initialTimestamp,
		initialRequestTimestamp,
		dc,
		is_rollout,
		isCached: isCached ? true : false,
		rolloutData,
		requestUrl,
		st,
		// TODO fix both this and /packages/feature-business-logger/src/businessLogger.ts
		pageData: {
			pageNumber: 0,
			pageId: 'TODO',
			pageUrl: 'TODO',
			isLightbox: false,
		},
		viewerVersion: process.env.browser ? window.thunderboltVersion : process.env.APP_VERSION!,
	}
}

const createConsoleLogger = () => ({
	runAsyncAndReport: <T>(asyncMethod: () => Promise<T> | T, methodName: string) => {
		console.log(`${methodName}`)
		return Promise.resolve(asyncMethod())
	},
	reportAsyncWithCustomKey: <T>(asyncMethod: () => Promise<T>, methodName: string, key: string) => {
		console.log(`${methodName} ${key}`)
		return Promise.resolve(asyncMethod())
	},
	runAndReport: <T>(fn: () => T, methodName: string) => {
		console.log(`${methodName}`)
		return fn()
	},
	phaseStarted: console.log,
	phaseEnded: console.log,
	meter: console.log,
	appLoaded: () => console.log('appLoaded'),
	reportAppLoadStarted: console.log,
	captureError: (...args: any) => {
		console.error(...args)
	},
	setGlobalsForErrors: (/* {tags, extras} = {}*/) => {},
	breadcrumb: (/* messageContent, additionalData = {}*/) => {},
	interactionStarted: console.log,
	interactionEnded: console.log,
	registerPlatformWidgets: console.log,
})

const addTagsFromObject = (scope: any, obj: any) => {
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			scope.setTag(key, obj[key])
		}
	}
}

const extractFingerprints = ({ values }: any) => {
	if (values && values.length) {
		const fingerprints = []
		fingerprints.push(values[0].value)
		fingerprints.push(values[0].type)
		if (values[0].stacktrace && values[0].stacktrace.length) {
			fingerprints.push(values[0].stacktrace[0].function)
		}
		return fingerprints
	}
	return ['noData']
}

const getEnvironment = (fleetCode: number) => {
	if (fleetCode === 0) {
		return 'Production'
	} else if (fleetCode === 1) {
		return 'Rollout'
	}
	return 'Canary'
}

const extractFileNameFromErrorStack = (errorStack: string) => {
	const stackArray = errorStack.match(/([\w-.]+(?:\.js|\.ts))/)
	if (!stackArray || !stackArray.length) {
		return 'anonymous function'
	}
	return stackArray[0].split('.')[0]
}

const shouldFilter = (message: string) => !message

export {
	getBiStore,
	createConsoleLogger,
	addTagsFromObject,
	extractFingerprints,
	getEnvironment,
	extractFileNameFromErrorStack,
	shouldFilter,
	frogUrlOverride,
}
