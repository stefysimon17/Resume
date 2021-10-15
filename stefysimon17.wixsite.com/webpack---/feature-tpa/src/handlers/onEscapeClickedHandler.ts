import { withDependencies } from '@wix/thunderbolt-ioc'
import { TpaHandlerProvider } from '@wix/thunderbolt-symbols'
// import { TpaModalSymbol, TpaPopupSymbol } from '../symbols'
// import { ITpaModal, ITpaPopup } from '../types'
// import { closeWindow } from '../utils/closeWindow'

export const OnEscapeClickedHandler = withDependencies(
	[],
	// [TpaModalSymbol, TpaPopupSymbol],
	// (tpaModal: ITpaModal, tpaPopup: ITpaPopup): TpaHandlerProvider => ({
	(): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				// onEscapeClicked: (compId) => closeWindow({ tpaModal, tpaPopup, compId })
				// TODO: uncomment when WIX-TPA-UI will stop propegation on their UI components
			}
		},
	})
)
