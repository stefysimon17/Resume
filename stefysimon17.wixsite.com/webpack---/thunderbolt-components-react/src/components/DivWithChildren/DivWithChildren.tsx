import React, { ComponentType, ReactNode } from 'react'

export type DivWithChildrenCompProps = {
	children: () => ReactNode
	id: string
}

const DivWithChildren: ComponentType<DivWithChildrenCompProps> = ({ children, id }) => {
	return <div id={id}>{children()}</div>
}

export default DivWithChildren
