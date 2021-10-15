import { withDependencies } from '@wix/thunderbolt-ioc'
import { ReducedMotionSymbol } from '@wix/thunderbolt-symbols'
import { IComponentPropsExtender } from 'feature-components'
import { REDUCED_MOTION_COMPONENTS_TYPES } from './reducedMotionComponentTypes'

const ReducedMotionFactory = (reducedMotion: boolean): IComponentPropsExtender<{ reducedMotion: boolean }, unknown> => {
	return {
		componentTypes: REDUCED_MOTION_COMPONENTS_TYPES,
		getExtendedProps: () => ({ reducedMotion }),
	}
}

export const ReducedMotion = withDependencies([ReducedMotionSymbol], ReducedMotionFactory)
