import _ from 'lodash'
import type { LocationManager, PlatformEnvData, LocationOnChangeHandler } from '@wix/thunderbolt-symbols'
import { getRelativeUrl } from 'feature-router'
import type { BootstrapData, PlatformUrlManagerSdkHandlers } from '../types'

export function CreateLocationManager({
	handlers,
	platformEnvData,
	bootstrapData,
}: {
	handlers: PlatformUrlManagerSdkHandlers
	platformEnvData: PlatformEnvData
	bootstrapData: BootstrapData
}): LocationManager {
	let url = getDecodedUrlObject(platformEnvData.location.rawUrl)

	const onChangeHandlers: Array<LocationOnChangeHandler> = []

	if (process.env.browser) {
		handlers.registerLocationOnChangeHandler((href: string) => {
			url = getDecodedUrlObject(href)
			onChangeHandlers.forEach((handler) => handler({ path: getPath() }))
		})
	}

	const getFullPath = () => {
		if (platformEnvData.location.externalBaseUrl) {
			return getRelativeUrl(url.href, platformEnvData.location.externalBaseUrl).replace(/^\.\//, '').split('/')
		}

		return url.pathname.substring(1).split('/').slice(1)
	}

	const getPath = () => {
		const fullPath = getFullPath()
		return fullPath[0] === prefix ? fullPath.slice(1) : fullPath
	}

	const routerData = getFullPath()[0] && _.find(bootstrapData.platformAPIData.routersConfigMap, { prefix: getFullPath()[0] })
	const prefix = routerData && routerData.prefix

	return {
		getBaseUrl() {
			return platformEnvData.location.externalBaseUrl
		},
		getLocation() {
			return url
		},
		getSearchParams() {
			const params: Record<string, Array<string> | string> = {}
			url.searchParams.forEach((value, key) => {
				const values = url.searchParams.getAll(key)
				params[key] = values.length > 1 ? values : value
			})
			return params
		},
		setSearchParam(key, value) {
			url.searchParams.set(key, value)
		},
		deleteSearchParam(key) {
			url.searchParams.delete(key)
		},
		onChange(handler) {
			onChangeHandlers.push(handler)
		},
		getPath,
		getPrefix() {
			return prefix
		},
	}
}

const getDecodedUrlObject = (url: string) =>
	new Proxy(new URL(url), {
		get(target, prop: keyof URL) {
			switch (prop) {
				case 'href':
				case 'pathname':
					return decodeURI(target[prop])
				case 'search':
					return decodeURIComponent(target[prop])
				default:
					return target[prop]
			}
		},
	})
