export const importEditorSdkFactory = async () => {
	const { EditorSdkFactory } = await import('feature-editor-wix-code-sdk/factory' /* webpackChunkName: "feature-editor-wix-code-sdk" */)
	return EditorSdkFactory
}
