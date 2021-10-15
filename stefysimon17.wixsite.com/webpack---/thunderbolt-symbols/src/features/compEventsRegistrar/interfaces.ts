export type CompAction = Function
export type ActionProps = Record<string, CompAction>

export type CompEventsRegistrarSubscriber = (compId: string, newActions: ActionProps) => void
export interface ICompEventsRegistrar {
	register: (compId: string, eventName: string, compAction: CompAction) => void
	subscribeToChanges: (callback: CompEventsRegistrarSubscriber) => void
}

export const CompEventsRegistrarSym = Symbol.for('CompEventsRegistrar')
