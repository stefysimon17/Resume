import { ProviderCreator } from '@wix/thunderbolt-ioc'
import { IPopups, PopupsSymbol } from 'feature-popups'

export type IPopupApi = { getPopupsApi: () => IPopups | null }

export const popupApiProvider: ProviderCreator<IPopupApi> = (container) => {
	return async () => ({
		getPopupsApi: (): IPopups | null => {
			try {
				return container.get(PopupsSymbol)
			} catch {
				return null
			}
		},
	})
}
