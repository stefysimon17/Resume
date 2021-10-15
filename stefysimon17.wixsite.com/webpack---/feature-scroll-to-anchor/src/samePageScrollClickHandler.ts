import { withDependencies } from '@wix/thunderbolt-ioc'
import { ILinkClickHandler } from '@wix/thunderbolt-symbols'
import type { ISamePageScroll } from './types'
import { SamePageScrollSymbol } from './symbols'
import { IUrlHistoryManager, UrlHistoryManagerSymbol, removeQueryParams, replaceProtocol } from 'feature-router'

export const samePageScrollClickHandlerFactory = (
	samePageScroll: ISamePageScroll,
	urlHistoryManager: IUrlHistoryManager
): ILinkClickHandler => ({
	handleClick: (anchor) => {
		const isLinkToNewTab = anchor.getAttribute('target') === '_blank'
		if (isLinkToNewTab) {
			return false
		}

		const siteProtocol = urlHistoryManager.getParsedUrl().protocol
		const href = replaceProtocol(anchor.getAttribute('href') || '', siteProtocol)
		const hrefWithoutQueryParams = href && removeQueryParams(href)
		const fullUrlWithoutQueryParams = urlHistoryManager.getFullUrlWithoutQueryParams()
		const isCurrentPageNavigation = hrefWithoutQueryParams === fullUrlWithoutQueryParams
		const anchorCompId = anchor.getAttribute('data-anchor-comp-id') || ''
		const anchorDataId = anchor.getAttribute('data-anchor') || ''
		const isHrefToTopOfPage = hrefWithoutQueryParams === '#'
		if (!anchorCompId && !anchorDataId && (isCurrentPageNavigation || isHrefToTopOfPage)) {
			if (!isHrefToTopOfPage) {
				// reflect any query params changes in the url history on same page navigation
				urlHistoryManager.pushUrlState(new URL(href as string))
			}

			// Need to scroll to top of the page if anchor href is for current page
			return samePageScroll.scrollToAnchor({ anchorDataId: 'SCROLL_TO_TOP' })
		}

		return samePageScroll.scrollToAnchor({ anchorDataId, anchorCompId })
	},
})

export const SamePageScrollClickHandler = withDependencies(
	[SamePageScrollSymbol, UrlHistoryManagerSymbol],
	samePageScrollClickHandlerFactory
)
