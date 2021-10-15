export const importWidgetSdkFactory = async () => {
	const { WidgetSdkFactory } = await import('feature-widget-wix-code-sdk/factory' /* webpackChunkName: "feature-widget-wix-code-sdk" */)
	return WidgetSdkFactory
}
