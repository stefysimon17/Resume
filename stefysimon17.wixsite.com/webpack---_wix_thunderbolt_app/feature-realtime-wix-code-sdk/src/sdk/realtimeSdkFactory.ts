import { WixCodeApiFactoryArgs } from '@wix/thunderbolt-symbols'
import { namespace, RealtimeWixCodeSdkWixCodeApi } from '..'
import { realtime } from './realtime'
import { Environment } from './environment'

type RealtimeNamespace = { [namespace]: RealtimeWixCodeSdkWixCodeApi }

export function RealtimeSdkFactory({ platformUtils }: WixCodeApiFactoryArgs): RealtimeNamespace {
	const environment = new Environment(platformUtils.wixCodeNamespacesRegistry)
	const duplexerSocketsServiceUrl = 'duplexer.wix.com'

	return {
		[namespace]: realtime(duplexerSocketsServiceUrl, environment),
	}
}
