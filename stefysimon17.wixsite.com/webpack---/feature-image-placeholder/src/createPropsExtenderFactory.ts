import type { ImagePlaceholder, ImagePlaceholderData, ImagePlaceholderPageConfig } from './types'
import { IComponentPropsExtender } from 'feature-components'
import { IMAGE_PLACEHOLDER_COMPONENTS_TYPES } from './imagePlaceholderComponentTypes'

export default function createFactory(imageClientApi: any) {
	return (
		pageConfig: ImagePlaceholderPageConfig
	): IComponentPropsExtender<
		{ getPlaceholder: (imagePlaceholderData: ImagePlaceholderData) => ImagePlaceholder },
		unknown
	> => {
		const {
			isSEOBot,
			isSeoExpOpen,
			isFinalForceWebpExpOpen,
			isFinalForceNoWebpExpOpen,
			staticMediaUrl,
		} = pageConfig

		const getPlaceholder = ({ fittingType, src, target }: ImagePlaceholderData): ImagePlaceholder => {
			const placeholder = imageClientApi.getPlaceholder(fittingType, src, target, {
				isSEOBot: isSEOBot || isSeoExpOpen || isFinalForceWebpExpOpen || isFinalForceNoWebpExpOpen,
			})
			const shouldForceWebpByExp = isSeoExpOpen || isFinalForceWebpExpOpen
			if (placeholder && placeholder.uri) {
				const uriWithFormatOverride = shouldForceWebpByExp
					? placeholder.uri.replace(/(\.jpg|\.jpeg|\.png)$/, '.webp')
					: placeholder.uri
				placeholder.uri = `${staticMediaUrl}/${uriWithFormatOverride}`
			}

			return placeholder
		}

		return {
			componentTypes: IMAGE_PLACEHOLDER_COMPONENTS_TYPES,
			getExtendedProps: () => ({ getPlaceholder }),
		}
	}
}
