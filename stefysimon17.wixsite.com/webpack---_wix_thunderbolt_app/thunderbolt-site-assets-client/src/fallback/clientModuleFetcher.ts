import _ from 'lodash'
import { FetchFn, SiteAssetsClientTopology, SiteAssetsManifests, SiteAssetsModuleName } from '@wix/thunderbolt-symbols'
import { ModuleFetcherRequest, SiteAssetsModuleFetcher } from '@wix/site-assets-client'
import { loadScriptTag, loadScriptWithRequireJS, scriptUrls } from '@wix/thunderbolt-commons'

type Topology = {
	pathInFileRepo: SiteAssetsClientTopology['pathOfTBModulesInFileRepoForFallback']
	fileRepoUrl: SiteAssetsClientTopology['fileRepoUrl']
}
const loadModule = (
	moduleName: SiteAssetsModuleName,
	manifests: SiteAssetsManifests,
	{ pathInFileRepo, fileRepoUrl }: Topology,
	fetchFn: FetchFn,
	env: 'web' | 'webWorker' = 'web'
) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async (module: object = {}, exports: object = {}) => {
		const pathInBeckyRepo = `${pathInFileRepo}${env === 'webWorker' ? 'site-assets-webworker/' : ''}`

		const moduleHash: string = manifests[env].modulesToHashes[moduleName]
		const moduleFileUrl = `${fileRepoUrl}/${pathInBeckyRepo}${moduleName}.${moduleHash}.js`
		// TODO: handle failure
		const script = await fetchFn(moduleFileUrl).then((resp) => resp.text())

		if (env === 'web') {
			const webpackRuntimeBundleHash: string = manifests[env].webpackRuntimeBundle
			const webpackRuntimeBundleUrl = `${fileRepoUrl}/${pathInBeckyRepo}webpack-runtime.${webpackRuntimeBundleHash}.js`
			// TODO: handle failure
			const webpackRuntime = await fetchFn(webpackRuntimeBundleUrl).then((resp) => resp.text())

			// eslint-disable-next-line no-eval
			eval(webpackRuntime)
		}
		// eslint-disable-next-line no-eval
		eval(script)
		// @ts-ignore
		return module.exports.default
	}
}

const loadDataFixersModule = (
	moduleName: string,
	version: string,
	moduleRepoUrl: string,
	env: 'web' | 'webWorker' = 'web',
	fetchFn: FetchFn
) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async (module: object = {}, exports: object = {}) => {
		const santaDataFixerModuleFileUrl = (() => {
			const santaDataFixerModuleSuffix = env === 'web' ? 'thunderbolt' : 'thunderbolt-webworker'

			if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
				// use hardcoded version that includes thunderbolt dedicated build
				return `${moduleRepoUrl}/@wix/${moduleName}@${version}/dist/${moduleName}-${santaDataFixerModuleSuffix}.js`
			} else {
				return `${moduleRepoUrl}/@wix/${moduleName}@${version}/dist/${moduleName}-${santaDataFixerModuleSuffix}.min.js`
			}
		})()

		if (env === 'web') {
			await window.ThunderboltElementsLoaded
			/**
			 * we need to await reactAndReactDOMLoaded before loading the requirejs
			 * otherwise react is registered as anonymous module
			 */
			await window.reactAndReactDOMLoaded

			await loadScriptTag(scriptUrls(moduleRepoUrl).REQUIRE_JS)
			window.define!('_', [], () => _)
			window.define!('react', [], () => window.React)
			window.define!('reactDOM', [], () => window.ReactDOM)

			return loadScriptWithRequireJS(santaDataFixerModuleFileUrl)
		} else {
			// TODO: handle failure
			const dataFixerScript = await fetchFn(santaDataFixerModuleFileUrl).then((resp) => resp.text())

			// eslint-disable-next-line no-eval
			eval(dataFixerScript)

			// @ts-ignore
			return module.exports
		}
	}
}

export const clientModuleFetcher = (
	fetchFn: FetchFn,
	{ fileRepoUrl, pathOfTBModulesInFileRepoForFallback, moduleRepoUrl }: SiteAssetsClientTopology,
	manifests: { thunderbolt: SiteAssetsManifests },
	env: 'web' | 'webWorker' = 'web'
): SiteAssetsModuleFetcher => {
	return {
		fetch: async <T>(request: ModuleFetcherRequest): Promise<T> => {
			const { module, version } = request

			if (module.startsWith('thunderbolt-')) {
				const topology: Topology = {
					fileRepoUrl,
					pathInFileRepo: pathOfTBModulesInFileRepoForFallback,
				}
				return await loadModule(module as SiteAssetsModuleName, manifests.thunderbolt, topology, fetchFn, env)()
			} else {
				return await loadDataFixersModule(module, version, moduleRepoUrl, env, fetchFn)()
			}
		},
	}
}
