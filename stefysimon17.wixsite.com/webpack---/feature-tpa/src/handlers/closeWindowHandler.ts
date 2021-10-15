import { withDependencies } from '@wix/thunderbolt-ioc'
import { ITpaModal, ITpaPopup } from '../types'
import { TpaModalSymbol, TpaPopupSymbol } from '../symbols'
import { TpaHandlerProvider } from '@wix/thunderbolt-symbols'
import { closeWindow } from '../utils/closeWindow'

export const CloseWindowHandler = withDependencies(
	[TpaModalSymbol, TpaPopupSymbol],
	(tpaModal: ITpaModal, tpaPopup: ITpaPopup): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				closeWindow: (compId, onCloseMessage) => closeWindow({ tpaModal, tpaPopup, compId, onCloseMessage }),
			}
		},
	})
)
