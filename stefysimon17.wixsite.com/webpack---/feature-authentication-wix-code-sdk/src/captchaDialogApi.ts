import { withDependencies } from '@wix/thunderbolt-ioc'
import { IStructureAPI, StructureAPI, Props, IPropsStore, ILanguage, LanguageSymbol } from '@wix/thunderbolt-symbols'
import type { ICaptchaDialog, CaptchaDialogProps } from './types'
import { DIALOG_COMPONENT_ID } from './symbols'
import { enableCyclicTabbing, disableCyclicTabbing } from '@wix/thunderbolt-commons'
import { isCaptchaTokenRequired } from './utils'

const captchaDialogFactory = (
	structureApi: IStructureAPI,
	propsStore: IPropsStore,
	language: ILanguage
): ICaptchaDialog => {
	const openDialog = (props: CaptchaDialogProps) => {
		enableCyclicTabbing()
		propsStore.update({ [DIALOG_COMPONENT_ID]: props })
		structureApi.addComponentToDynamicStructure(DIALOG_COMPONENT_ID, {
			componentType: 'CaptchaDialog',
			components: [],
		})
	}

	const hideDialog = () => {
		disableCyclicTabbing()
		structureApi.removeComponentFromDynamicStructure(DIALOG_COMPONENT_ID)
	}

	const api: ICaptchaDialog = {
		openCaptchaDialog() {
			return new Promise((resolve) => {
				hideDialog()
				openDialog({
					onVerified: (token: string) => {
						hideDialog()
						resolve(token)
					},
					onClose: () => {
						hideDialog()
						resolve(null)
					},
					language: language.userLanguage,
				})
			})
		},
		async withCaptchaChallengeHandler(cb: (token?: string) => any) {
			const handler = async (token?: string): Promise<any> => {
				try {
					const response = await cb(token)
					return response
				} catch (error) {
					if (isCaptchaTokenRequired(error)) {
						// openCaptchaDialog might return empty string in case the captcha was closed
						token = (await api.openCaptchaDialog()) || undefined
						if (token) {
							return handler(token)
						}
					}
					throw error
				}
			}
			return handler()
		},
	}
	return api
}

export const CaptchaDialog = withDependencies([StructureAPI, Props, LanguageSymbol], captchaDialogFactory)
