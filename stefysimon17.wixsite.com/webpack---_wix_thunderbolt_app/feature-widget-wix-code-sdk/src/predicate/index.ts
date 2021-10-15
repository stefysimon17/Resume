import type { PlatformEnvData } from '@wix/thunderbolt-symbols'

export const isWixWidgetEditorRequired = ({ platformEnvData }: { platformEnvData: PlatformEnvData }): boolean => {
	const url = new URL(platformEnvData.location.rawUrl)
	const sdkVersion = url.searchParams.get('sdkVersion')
	const componentRef = url.searchParams.get('componentRef')

	return sdkVersion !== null && componentRef !== null
}
