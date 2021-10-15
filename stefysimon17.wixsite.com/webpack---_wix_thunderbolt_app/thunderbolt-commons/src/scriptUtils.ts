declare global {
	interface Window {
		define?: Function & { amd: boolean }
		pmrpc?: {
			api: {
				set(appId: string, api: any): void
				request<T>(appId: string, target: { target: Element }): Promise<T>
			}
		}
	}
}

export function loadScriptTag(src: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		if (!document) {
			reject('document is not defined when trying to load script tag')
		}
		const script = document.createElement('script')
		script.src = src
		script.onerror = reject
		script.onload = resolve
		document.head.appendChild(script)
	})
}

export function loadScriptWithRequireJS<T>(src: string): Promise<T> {
	return new Promise((resolve, reject) => __non_webpack_require__([src], resolve, reject))
}

export const scriptUrls = (moduleRepoUrl: string) => ({
	PM_RPC: `${moduleRepoUrl}/pm-rpc@3.0.3/build/pm-rpc.min.js`,
	REQUIRE_JS: `${moduleRepoUrl}/requirejs-bolt@2.3.6/requirejs.min.js`,
})

export const loadPmRpc = async (moduleRepoUrl: string) => {
	if (window.pmrpc) {
		return window.pmrpc
	}
	if (window.define?.amd) {
		return loadScriptWithRequireJS(scriptUrls(moduleRepoUrl).PM_RPC)
	}
	await loadScriptTag(scriptUrls(moduleRepoUrl).PM_RPC)
	return window.pmrpc
}
