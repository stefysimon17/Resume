import { WixCodeNamespacesRegistry } from '@wix/thunderbolt-symbols'

export const createWixCodeNamespacesRegistry = function (): WixCodeNamespacesRegistry {
	let wixCodeNamespaces: any = null
	return {
		get(namespace) {
			if (!wixCodeNamespaces) {
				throw new Error(`get(${namespace}) cannot be used inside the factory function of the namespace`)
			}
			return wixCodeNamespaces[namespace]
		},
		registerWixCodeNamespaces(_wixCodeNamespaces) {
			wixCodeNamespaces = _wixCodeNamespaces
		},
	}
}
