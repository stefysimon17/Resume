export interface ICompsLifeCycle {
	registerToCompLifeCycle: (
		compIds: Array<string>,
		callbackName: string,
		callback: (compId: string, displayedId: string, element: HTMLElement) => any
	) => void
	unregisterToCompLifeCycle: (compIds: Array<string>, callbackName: string) => void
	notifyCompDidMount: (compId: string, displayedId: string) => void
	waitForComponentToRender: (compId: string) => Promise<HTMLElement>
}

export const CompsLifeCycleSym = Symbol.for('CompsLifeCycle')
