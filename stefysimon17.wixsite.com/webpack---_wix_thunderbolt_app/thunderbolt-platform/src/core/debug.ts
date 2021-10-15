import { $W, WixCodeApi } from '@wix/thunderbolt-symbols'

declare const self: DedicatedWorkerGlobalScope & { debugApi?: { wixCodeApi: WixCodeApi; $w: $W } }

export const initializeDebugApi = ({ wixCodeApi, $w }: { wixCodeApi: WixCodeApi; $w: $W }) => {
	self.debugApi = {
		wixCodeApi,
		$w,
	}
}
