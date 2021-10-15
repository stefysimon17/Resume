import { IMultilingual } from '@wix/thunderbolt-symbols'

export const currentLanguage = (language: string, multilingual?: Omit<IMultilingual, 'setCurrentLanguage'>): string => {
	if (multilingual && multilingual.currentLanguage && multilingual.currentLanguage.name) {
		return multilingual.currentLanguage.name
	}

	return language
}
