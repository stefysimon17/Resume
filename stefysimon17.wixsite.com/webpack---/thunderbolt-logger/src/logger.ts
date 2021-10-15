import type { Hub } from '@sentry/types'
import type { ILogger, Interaction, Phase, LoggerConfig, CreateLoggerApi } from './types'
import type {
	IStartInteractionOptions,
	IEndInteractionOptions,
	IAppIdentifier,
} from '@wix/fe-essentials-viewer-platform/fedops'
import {
	addTagsFromObject,
	extractFingerprints,
	extractFileNameFromErrorStack,
	shouldFilter,
} from './utils/loggerUtils'

declare global {
	interface Window {
		Sentry: Hub & { forceLoad: () => void }
	}
}

export const createLoggerApi: CreateLoggerApi = ({
	fedopsLogger,
	sentry,
	sentryStore,
	errorLimit,
	shouldMuteErrors = false,
	isSsr = false,
}: LoggerConfig): ILogger => {
	let sessionErrorLimit = errorLimit || 99999
	const ongoingfedops = {
		interactions: 'none',
		phase: 'none',
		errors: 'none',
	}
	if (!isSsr) {
		// @ts-ignore
		window.fedops.ongoingfedops = ongoingfedops
	}

	const getInstance = (forceLoad: boolean = false) => {
		if (!isSsr && forceLoad) {
			window.Sentry.forceLoad()
		}
		if (sentry) {
			return sentry
		}
		return window.Sentry
	}

	getInstance().configureScope((scope) => {
		scope.addEventProcessor((event, hint) => {
			// @ts-ignore
			const { message } = hint?.originalException
			if (shouldMuteErrors || shouldFilter(message)) {
				return null
			}
			event.release = sentryStore.release
			event.environment = sentryStore.environment
			if (event.level === 'error') {
				ongoingfedops.errors = message
			}
			if (!event.fingerprint) {
				const fingerprints = extractFingerprints(event.exception)
				event.fingerprint = [...fingerprints]
			}
			if (sessionErrorLimit) {
				sessionErrorLimit--
				return event
			}
			return null
		})
		scope.setUser({ id: sentryStore.user })
		addTagsFromObject(scope, {
			...ongoingfedops,
		})
	})

	const getErrorThatDoesNotFreezeBrowser = (error: Error) => {
		// long stacks freeze the browser during some sentry internal calculation.
		// somewhere here: https://github.com/getsentry/sentry-javascript/blob/668f44ffdb068cd2d0f89085e50c9d1b4dd38295/packages/browser/src/tracekit.ts#L186
		// this is internal crap that can't be unit tested.
		if (!error.stack || error.stack.length <= 2000) {
			return error
		}

		const { name, message, stack } = error
		const errorThatDoesNotFreezeBrowser = new (error.constructor as ErrorConstructor)(message)
		errorThatDoesNotFreezeBrowser.name = name
		errorThatDoesNotFreezeBrowser.stack = `${stack.substring(0, 1000)}\n...\n${stack.substring(
			stack.length - 1000
		)}`
		return errorThatDoesNotFreezeBrowser
	}

	const captureError = (
		error: Error,
		{
			tags,
			extra,
			groupErrorsBy = 'tags',
			level = 'error',
		}: {
			tags: { [key: string]: string | boolean }
			extra?: { [key: string]: any }
			groupErrorsBy?: 'tags' | 'values'
			level?: string
		}
	) =>
		getInstance(true).withScope((scope: any) => {
			const fingerprints = []
			scope.setLevel(level)
			for (const key in tags) {
				if (tags.hasOwnProperty(key)) {
					scope.setTag(key, tags[key])
					if (groupErrorsBy === 'tags') {
						fingerprints.push(key)
					} else if (groupErrorsBy === 'values') {
						fingerprints.push(tags[key])
					}
				}
			}

			for (const key in extra) {
				if (extra.hasOwnProperty(key)) {
					scope.setExtra(key, extra[key])
				}
			}

			const fileName = error.stack ? extractFileNameFromErrorStack(error.stack) : 'unknownFile'
			scope.setExtra('_fileName', fileName)
			scope.setFingerprint([error.message, fileName, ...fingerprints])

			if (sessionErrorLimit) {
				getInstance().captureException(getErrorThatDoesNotFreezeBrowser(error))
			}
			if (level === 'error') {
				console.log(error) // Sentry capture exception swallows the error
			}
		})
	const phaseStarted = (phase: Phase, interactionOptions?: Partial<IAppIdentifier>) => {
		ongoingfedops.phase = ongoingfedops.phase === 'none' ? phase : ongoingfedops.interactions + phase
		getInstance().addBreadcrumb({ message: 'interaction start: ' + phase })
		// @ts-ignore
		fedopsLogger.appLoadingPhaseStart(phase, interactionOptions || {})
	}
	const phaseEnded = (phase: Phase, interactionOptions?: Partial<IAppIdentifier>) => {
		ongoingfedops.phase = ongoingfedops.phase === phase ? 'none' : ongoingfedops.interactions.replace(phase, '')
		getInstance().addBreadcrumb({ message: 'interaction end: ' + phase })
		// @ts-ignore
		fedopsLogger.appLoadingPhaseFinish(phase, interactionOptions || {})
	}
	const interactionStarted = (interaction: Interaction, interactionOptions?: Partial<IStartInteractionOptions>) => {
		ongoingfedops.interactions =
			ongoingfedops.interactions === 'none' ? interaction : ongoingfedops.interactions + interaction
		getInstance().addBreadcrumb({ message: 'interaction start: ' + interaction })
		fedopsLogger.interactionStarted(interaction, interactionOptions || {})
	}
	const interactionEnded = (interaction: Interaction, interactionOptions?: Partial<IEndInteractionOptions>) => {
		ongoingfedops.interactions =
			ongoingfedops.interactions === interaction ? 'none' : ongoingfedops.interactions.replace(interaction, '')
		getInstance().addBreadcrumb({ message: 'interaction end: ' + interaction })
		fedopsLogger.interactionEnded(interaction, interactionOptions || {})
	}
	const meter = (metricName: string, interactionOptions?: Partial<IStartInteractionOptions>) => {
		getInstance().addBreadcrumb({ message: 'meter: ' + metricName })
		fedopsLogger.interactionStarted(metricName, interactionOptions || {})
	}
	if (!isSsr) {
		// @ts-ignore
		window.fedops.phaseStarted = phaseStarted
		// @ts-ignore
		window.fedops.phaseEnded = phaseEnded
	}

	let registerPlatformTenantsInvoked = false
	return {
		reportAsyncWithCustomKey: <T>(asyncMethod: () => Promise<T>, methodName: string, key: string): Promise<T> => {
			// @ts-ignore FEDINF-1937 missing type
			interactionStarted(methodName, { customParam: { key } })
			return asyncMethod()
				.then(
					(res): Promise<T> => {
						// @ts-ignore FEDINF-1937 missing type
						interactionEnded(methodName, { customParam: { key } })
						return Promise.resolve(res)
					}
				)
				.catch((error) => {
					captureError(error, { tags: { methodName } })
					return Promise.reject(error)
				})
		},
		runAsyncAndReport: async <T>(
			asyncMethod: () => Promise<T>,
			methodName: string,
			reportExeception: boolean = true
		): Promise<T> => {
			try {
				interactionStarted(`${methodName}`)
				const fnResult = await asyncMethod()
				interactionEnded(`${methodName}`)
				return fnResult
			} catch (e) {
				if (reportExeception) {
					captureError(e, { tags: { methodName } })
				}
				throw e
			}
		},
		runAndReport: <T>(method: () => T, methodName: string): T => {
			interactionStarted(methodName)
			try {
				const t = method()
				interactionEnded(methodName)
				return t
			} catch (e) {
				captureError(e, { tags: { methodName } })
				throw e
			}
		},
		captureError,
		setGlobalsForErrors: ({ tags, extra }) =>
			getInstance().configureScope((scope: any) => {
				scope.addEventProcessor((event: any) => {
					if (extra) {
						event.extra = event.extra || {}
						Object.assign(event.extra, extra)
					}

					if (tags) {
						event.tags = event.tags || {}
						Object.assign(event.tags, tags)
					}

					return event
				})
			}),
		breadcrumb: (messageContent, additionalData = {}) =>
			getInstance().addBreadcrumb({
				message: messageContent,
				data: additionalData,
			}),
		interactionStarted,
		interactionEnded,
		phaseStarted,
		phaseEnded,
		meter,
		reportAppLoadStarted: () => fedopsLogger.appLoadStarted(),
		appLoaded: () => {
			ongoingfedops.phase = 'siteLoaded'
			window.onoffline = () => {}
			window.ononline = () => {}
			// @ts-ignore
			removeEventListener('pagehide', window.fedops.pagehide)
			fedopsLogger.appLoaded()
			// TODO FEDINF-4745 fedops to report cwv metrics for appName if "reportBlackbox" is set to true
			if (!registerPlatformTenantsInvoked) {
				fedopsLogger.registerPlatformTenants(['thunderbolt'])
			}
		},
		registerPlatformWidgets: (widgetAppNames: Array<string>) => {
			registerPlatformTenantsInvoked = true
			fedopsLogger.registerPlatformTenants(['thunderbolt', ...widgetAppNames])
		},
	}
}
