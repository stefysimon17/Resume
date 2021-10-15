import { isSafeUrl } from '@wix/thunderbolt-commons'
import { IComponentsRegistry } from '@wix/editor-elements-registry/2.0/types'

export interface IComponentsCommonRegistry {
	getStylableMetadataURLs: () => Array<string>
}

export const splitComponentName = (componentName: string) => componentName.split('_')
export const getComponentType = (componentName: string) => splitComponentName(componentName)[0]

const shouldPreserveFullUrl = (url: string) => isSafeUrl(new URL(url))

export const createCommonRegistryMethods = <TComponentsRegistry extends IComponentsRegistry<any>>(
	registryAPI: TComponentsRegistry
): IComponentsCommonRegistry => {
	return {
		getStylableMetadataURLs() {
			return registryAPI
				.getLibrariesAssets()
				.filter((asset) => asset.type === 'stylable-metadata')
				.map(({ url }) => {
					if (shouldPreserveFullUrl(url)) {
						return url
					}

					const [, stylableHash] = url.match(/([a-zA-Z0-9.-]+)\.metadata\.json/) || []
					return stylableHash ? stylableHash : ''
				})
				.filter((url) => !!url)
		},
	}
}
