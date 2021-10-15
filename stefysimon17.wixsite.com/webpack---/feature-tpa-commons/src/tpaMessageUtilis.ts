import type { TpaIncomingMessage } from './types'

export const parseMessage = (evt: any) => {
	if (evt.data) {
		try {
			return JSON.parse(evt.data)
		} catch (e) {}
	}
	return {}
}

export const isTpaMessage = (msg: TpaIncomingMessage<any>) => msg && ['TPA', 'TPA2'].includes(msg.intent)

export const editorOnlyHandlers = ['getWixUpgradeUrl', 'stylesReady', 'getViewModeInternal', 'setHelpArticle']
