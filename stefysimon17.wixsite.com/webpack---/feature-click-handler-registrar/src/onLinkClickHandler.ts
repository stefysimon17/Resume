import { withDependencies } from '@wix/thunderbolt-ioc'
import { LinkClickHandlersProvider } from './symbols'
import { ILinkClickHandlersProvider, IOnLinkClickHandler } from './types'

type HTMLElementTarget = HTMLElement | null
const getAnchorTarget = (event: MouseEvent) => {
	let eTarget = event.target as HTMLElementTarget

	while (eTarget && (!eTarget.tagName || eTarget.tagName.toLowerCase() !== 'a')) {
		eTarget = eTarget.parentNode as HTMLElementTarget
	}
	return eTarget
}

const cancelEvent = (e: MouseEvent) => {
	e.stopPropagation()
	e.preventDefault()
	return false
}

const onLinkClickHandler = ({ getHandlers }: ILinkClickHandlersProvider): IOnLinkClickHandler => {
	return {
		onLinkClick: (e: MouseEvent) => {
			if (e.metaKey || e.ctrlKey) {
				return
			}

			const anchorTarget = getAnchorTarget(e)
			if (!anchorTarget) {
				return
			}
			if (anchorTarget.getAttribute('data-cancel-link')) {
				cancelEvent(e)
				return
			}
			const handlers = getHandlers()
			for (const handler of handlers) {
				const didHandle = handler.handleClick(anchorTarget)
				if (didHandle) {
					e.preventDefault()
					e.stopPropagation()
					return
				}
			}
		},
	}
}

export const OnLinkClickHandler = withDependencies([LinkClickHandlersProvider], onLinkClickHandler)
