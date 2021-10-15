import _ from 'lodash'
import type { AnimationData, WixCodeAnimationsHandlers } from 'feature-animations'
import type { IPlatformAnimationsAPI, EffectOptionsTypes, BaseEffectOptions, EffectName } from './animations-types'
import type { PlatformEnvData, ModelsAPI } from '@wix/thunderbolt-symbols'

const effectAliasToEffectNameMap: { in: { [alias: string]: EffectName }; out: { [alias: string]: EffectName } } = {
	in: {
		arc: 'ArcIn',
		bounce: 'BounceIn',
		puff: 'DropIn',
		zoom: 'ExpandIn',
		fade: 'FadeIn',
		flip: 'FlipIn',
		float: 'FloatIn',
		fly: 'FlyIn',
		fold: 'FoldIn',
		glide: 'GlideIn',
		roll: 'Reveal',
		slide: 'SlideIn',
		spin: 'SpinIn',
		turn: 'TurnIn',
	},
	out: {
		arc: 'ArcOut',
		bounce: 'BounceOut',
		puff: 'PopOut',
		zoom: 'CollapseOut',
		fade: 'FadeOut',
		flip: 'FlipOut',
		float: 'FloatOut',
		fly: 'FlyOut',
		fold: 'FoldOut',
		glide: 'GlideOut',
		roll: 'Conceal',
		slide: 'SlideOut',
		spin: 'SpinOut',
		turn: 'TurnOut',
	},
}

const millisToSeconds = (num: number) => num / 1000

type EffectSpecificAnimationDataParamsModifiers = {
	[EffectName in keyof EffectOptionsTypes]: (effectOptions: EffectOptionsTypes[EffectName]) => Partial<AnimationData['params']>
}

type AnimationDataParamsFactory = <EffectName extends keyof EffectOptionsTypes, EffectOptions = EffectOptionsTypes[EffectName] & BaseEffectOptions>(
	effectName: EffectName,
	effectOptions: EffectOptions
) => Partial<AnimationData['params']>

const splitCamelCaseIntoWords = (txt: string) => txt.split(/(?=[A-Z])/)

export const PlatformAnimationsAPI = ({
	handlers,
	platformEnvData,
	modelsApi,
}: {
	handlers: WixCodeAnimationsHandlers
	platformEnvData: PlatformEnvData
	modelsApi: ModelsAPI
}): IPlatformAnimationsAPI => {
	const animationDataParamsFactory: AnimationDataParamsFactory = (effectName, effectOptions) => {
		const animationDataParams: Partial<AnimationData['params']> = {}

		const pick = <T>(props: Array<keyof T>) => (obj: T) => _.pick<T>(obj, props)

		const effectSpecificDataParamsBuilders: Partial<EffectSpecificAnimationDataParamsModifiers> = {
			ArcIn: pick(['direction']),
			ArcOut: pick(['direction']),
			BounceIn: ({ direction, intensity }) => ({
				bounce: intensity,
				// topLeft -> top left
				direction: splitCamelCaseIntoWords(direction).join(' ').toLowerCase(),
			}),
			BounceOut: ({ direction, intensity }) => ({
				bounce: intensity,
				// topLeft -> top left
				direction: splitCamelCaseIntoWords(direction).join(' ').toLowerCase(),
			}),
			FlipIn: pick(['direction']),
			FlipOut: pick(['direction']),
			FloatIn: pick(['direction']),
			FloatOut: pick(['direction']),
			FlyIn: pick(['direction']),
			FlyOut: pick(['direction']),
			FoldIn: pick(['direction']),
			FoldOut: pick(['direction']),
			GlideIn: pick(['angle', 'distance']),
			GlideOut: pick(['angle', 'distance']),
			Reveal: pick(['direction']),
			Conceal: pick(['direction']),
			SlideIn: pick(['direction']),
			SlideOut: pick(['direction']),
			SpinIn: pick(['direction', 'cycles']),
			SpinOut: pick(['direction', 'cycles']),
			TurnIn: pick(['direction']),
			TurnOut: pick(['direction']),
		}

		if (effectName in effectSpecificDataParamsBuilders) {
			Object.assign(animationDataParams, effectSpecificDataParamsBuilders[effectName]!(effectOptions as any))
		}
		return animationDataParams
	}

	return {
		async runAnimation({ compId, animationDirection, effectName: effectAlias, effectOptions }) {
			if (platformEnvData.window.isSSR) {
				return
			}
			const compsToAnimate = modelsApi.isRepeaterTemplate(compId) ? modelsApi.getDisplayedIdsOfRepeaterTemplate(compId) : compId
			// animation data expects values in seconds while user code api provides milliseconds!
			const duration = millisToSeconds(effectOptions.duration)
			const delay = millisToSeconds(effectOptions.delay)

			// runAnimation accept either the effect name or an alias of the effect.
			const effectName = effectAliasToEffectNameMap[animationDirection][effectAlias] || effectAlias

			// @ts-ignore
			const params = animationDataParamsFactory(effectName, effectOptions)
			const animationData = {
				duration,
				delay,
				targetId: compsToAnimate,
				name: effectName,
				params,
			}
			return handlers.runAnimation(animationData, animationDirection)
		},
	}
}
