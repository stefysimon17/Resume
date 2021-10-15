import { RendererProps } from '../types'
import Context from './AppContext'
import React, { useContext, ComponentType, useCallback, useMemo } from 'react'
import { ErrorBoundary, DeadComp } from './ErrorBoundary'
import _ from 'lodash'
import { getDisplayedId, getDefaultCompId } from '@wix/thunderbolt-commons'
import { useProps, useStoresObserver } from './hooks'

// id is the actual DOM id and compId is the id of the comp in the structure
type StructureComponentProps = { id: string; compId?: string; displayedItemId?: string }

const renderComps = (propsStore: RendererProps['props'], childId: string, displayedItemId?: string) => {
	const childProps = propsStore.get(childId)
	const defaultChildId = getDefaultCompId(childId)

	return (
		<StructureComponent
			displayedItemId={displayedItemId}
			compId={childId}
			id={defaultChildId}
			key={
				childProps?.key || (displayedItemId ? getDisplayedId(defaultChildId, displayedItemId!) : defaultChildId)
			}
		/>
	)
}

const StructureComponent: ComponentType<StructureComponentProps> = React.memo(
	({ id, compId = id, displayedItemId = '' }) => {
		const { structure: structureStore, props: propsStore, comps, translate, logger }: RendererProps = useContext(
			Context
		)
		let displayedId = displayedItemId ? getDisplayedId(compId, displayedItemId) : compId

		const compStructure = structureStore.get(displayedId) || structureStore.get(compId)
		if (!compStructure) {
			throw new Error(`Component is missing from structure`)
		}
		const { componentType, uiType } = compStructure
		const compClassType = uiType ? `${componentType}_${uiType}` : componentType
		const Comp = comps[compClassType]

		useStoresObserver(compId, displayedId)
		const compProps = useProps(displayedId, compId, compClassType)
		const components = compStructure!.components
		const children = useCallback(
			(itemId?: string) =>
				(components || []).map((childId) => renderComps(propsStore, childId, itemId || displayedItemId)),
			[components, displayedItemId, propsStore]
		)

		const slots = compStructure!.slots
		const slotsProps = useMemo(
			() => _.mapValues(slots, (slotId) => renderComps(propsStore, slotId, displayedItemId)),
			[slots, displayedItemId, propsStore]
		)

		// TODO: Remove the fallback once all components are implemented
		// in case comp is not inside repeater, remove hover box suffix if exist
		displayedId = displayedItemId ? displayedId : getDefaultCompId(id)
		const component = Comp ? (
			<Comp translate={translate} {...compProps} slots={slotsProps} id={displayedId}>
				{children}
			</Comp>
		) : (
			<DeadComp id={displayedId}>{children()}</DeadComp>
		)

		return (
			<ErrorBoundary
				id={displayedId}
				logger={logger}
				recursiveChildren={children}
				Component={Comp}
				compClassType={compClassType}
				sentryDsn={compProps?.sentryDsn}
			>
				{component}
			</ErrorBoundary>
		)
	}
)

export default StructureComponent
