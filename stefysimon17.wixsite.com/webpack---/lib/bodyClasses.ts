import { ViewerModel } from '@wix/thunderbolt-symbols'

export function getBodyClasses(viewerModel: ViewerModel): Array<string> {
	const isResponsive = viewerModel.site.isResponsive
	const classes = []

	if (viewerModel.viewMode === 'mobile') {
		classes.push('device-mobile-optimized')
	} else if (isResponsive && viewerModel.deviceInfo.deviceClass === 'Smartphone') {
		classes.push('device-mobile-responsive')
	} else if (
		(!isResponsive && viewerModel.deviceInfo.deviceClass === 'Tablet') ||
		viewerModel.deviceInfo.deviceClass === 'Smartphone'
	) {
		classes.push('device-mobile-non-optimized')
	}

	isResponsive && classes.push('responsive')

	return classes
}
