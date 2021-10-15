import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { LinkClickHandlersProvider, name, OnLinkClick, PreviewTooltipCallbackSymbol } from './symbols'
import { ClickHandlerRegistrar } from './clickHandlerRegistrar'
import { LifeCycle, IPageDidMountHandler } from '@wix/thunderbolt-symbols'
import { ClickHandlersProvider } from './linkClickHandlersProvider'
import type { IPreviewTooltipCallback } from './types'
import { OnLinkClickHandler } from './onLinkClickHandler'
import { PreviewTooltipCallback } from './previewTooltipCallback'

export const page: ContainerModuleLoader = (bind) => {
	bind(LinkClickHandlersProvider).to(ClickHandlersProvider)
	bind(OnLinkClick).to(OnLinkClickHandler)
	bind<IPageDidMountHandler>(LifeCycle.PageDidMountHandler).to(ClickHandlerRegistrar)
}

export { name, PreviewTooltipCallbackSymbol, PreviewTooltipCallback }
export type { IPreviewTooltipCallback }
