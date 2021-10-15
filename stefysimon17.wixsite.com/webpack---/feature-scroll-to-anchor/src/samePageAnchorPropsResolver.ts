import { withDependencies } from '@wix/thunderbolt-ioc'
import { IPropsStore, Props } from '@wix/thunderbolt-symbols'
import { QuickActionBarItemProps } from '@wix/thunderbolt-components'
import type { ISamePageAnchorPropsResolver } from './types'
import { IUrlHistoryManager, UrlHistoryManagerSymbol } from 'feature-router'
import { MenuItemProps } from '@wix/thunderbolt-becky-types'

export const SamePageAnchorPropsResolver = withDependencies(
	[Props, UrlHistoryManagerSymbol],
	(propsStore: IPropsStore, urlHistoryManager: IUrlHistoryManager): ISamePageAnchorPropsResolver => {
		const getQABUpdatedProps = (compId: string, fullUrl: string) => {
			const currentActionBarItems = propsStore.get('QUICK_ACTION_BAR').items
			const updatedItems = currentActionBarItems.map((item: QuickActionBarItemProps) =>
				item.compId === compId
					? {
							...item,
							link: { ...item.link, href: fullUrl },
					  }
					: item
			)

			return {
				items: updatedItems,
			}
		}

		const fixMenuItem = (item: MenuItemProps, fullUrl: string): MenuItemProps => {
			return {
				...item,
				...(item.link && ['SCROLL_TO_TOP', 'SCROLL_TO_BOTTOM'].includes(item.link.anchorDataId || '')
					? { link: { ...item.link, href: fullUrl } }
					: { link: item.link }),
				...(item.items && { items: item.items.map((menuItem) => fixMenuItem(menuItem, fullUrl)) }),
			}
		}

		const getFixedMenuItems = (items: Array<MenuItemProps>, fullUrl: string) =>
			items.map((item: MenuItemProps) => fixMenuItem(item, fullUrl))

		const getMenuUpdatedProps = (compId: string, fullUrl: string) => {
			const compProps = propsStore.get(compId)
			const currentMenuItems = compProps.items || compProps.options
			const updatedItems = getFixedMenuItems(currentMenuItems, fullUrl)

			return {
				items: updatedItems,
			}
		}

		const compTypeToPropsResolver: Record<string, (compId: string, fullUrl: string) => Record<string, any>> = {
			QuickActionBarItem: (compId, fullUrl) => getQABUpdatedProps(compId, fullUrl),
			DropDownMenu: (compId, fullUrl) => getMenuUpdatedProps(compId, fullUrl),
			ExpandableMenu: (compId, fullUrl) => getMenuUpdatedProps(compId, fullUrl),
			VerticalMenu: (compId, fullUrl) => getMenuUpdatedProps(compId, fullUrl),
		}

		return {
			getPropsOverrides: ({ compId, compType }) => {
				const fullUrl = urlHistoryManager.getFullUrlWithoutQueryParams()
				const isQABItem = compType === 'QuickActionBarItem'
				const targetCompIdForPropsUpdate = isQABItem ? 'QUICK_ACTION_BAR' : compId

				const propsResolver = compTypeToPropsResolver[compType]
				const updatedCompProps = propsResolver
					? propsResolver(compId, fullUrl)
					: {
							link: {
								...propsStore.get(targetCompIdForPropsUpdate).link,
								href: fullUrl,
							},
					  }

				return {
					[targetCompIdForPropsUpdate]: updatedCompProps,
				}
			},
		}
	}
)
