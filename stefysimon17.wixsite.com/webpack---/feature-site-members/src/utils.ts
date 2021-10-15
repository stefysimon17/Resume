import type { IFetchApi } from '@wix/thunderbolt-symbols'
import type { MemberDetailsDTO, MemberDetails, SocialAuthComponentProps, IGetSocialAuthComponentProps } from './types'
import { LOGIN_ERROR_CODES, SIGN_UP_ERROR_CODES } from './constants'
import _ from 'lodash'

export const memberDetailsFromDTO = (memberDetailsDTO: MemberDetailsDTO): MemberDetails => ({
	id: memberDetailsDTO.id,
	emailVerified: memberDetailsDTO.attributes?.emailVerified,
	role: memberDetailsDTO.memberRole,
	owner: memberDetailsDTO.owner,
	loginEmail: memberDetailsDTO.email,
	memberName: memberDetailsDTO.name ?? memberDetailsDTO.attributes?.name ?? '',
	firstName: memberDetailsDTO.attributes?.firstName,
	lastName: memberDetailsDTO.attributes?.lastName,
	imageUrl: memberDetailsDTO.attributes?.imageUrl ?? '',
	nickname: memberDetailsDTO.attributes?.nickname,
	profilePrivacyStatus: memberDetailsDTO.attributes?.privacyStatus,
	slug: memberDetailsDTO.slug,
	status: memberDetailsDTO.status,
	creationDate: memberDetailsDTO.dateCreated,
	lastUpdateDate: memberDetailsDTO.dateUpdated,
	emails: [],
	phones: [],
	addresses: [],
	labels: [],
	groups: [],
	customFields: [],
})

export const hangingPromise = <T>() => new Promise<T>(() => 0)

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getPerformFetch = (fetchApi: IFetchApi, requestInit: RequestInit, baseUrl: string) => (
	url: string,
	options: Partial<RequestInit> = {}
) => {
	const headers = {
		...requestInit.headers,
		...(options.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
		...options.headers,
		'x-wix-client-artifact-id': 'thunderbolt',
	}
	const optionsWithMergedHeaders = {
		...options,
		...{ headers },
	}

	// TODO: move this transformation into FetchApi
	const absoluteUrl = new URL(url, baseUrl).href

	return fetchApi
		.envFetch(absoluteUrl, { ...requestInit, ...optionsWithMergedHeaders })
		.then(async (response: Response) => {
			const data = await response.json()
			if (!response.ok) {
				// since we can't pass Response object between workers we better transform it now
				throw data
			}
			return data
		})
}

export const isLoginAcceptableError = (error: any) => {
	const errorCode = error?.details?.errorcode || error?.details?.errorCode
	return LOGIN_ERROR_CODES.includes(errorCode)
}

export const isSignupAcceptableError = (error: any) => {
	const errorCode = error?.details?.errorcode || error?.details?.errorCode
	return SIGN_UP_ERROR_CODES.includes(errorCode)
}

export const _getSocialAuthComponentProps: IGetSocialAuthComponentProps = ({
	config,
	viewerModel,
	sessionManager,
	handleOauthToken,
	handleSocialLoginResponse,
	isSocialAuthSupported,
}) => {
	const biVisitorId = sessionManager.getVisitorId() ?? '00000000-0000-0000-0000-000000000000'
	const props: SocialAuthComponentProps = {
		biVisitorId: '00000000-0000-0000-0000-000000000000',
		svSession: sessionManager.getUserSession()!,
		smCollectionId: config.smcollectionId,
		metaSiteId: viewerModel.site.metaSiteId,
		isSocialAuthSupported,
		// Will be called by the component after mounting the iframe to determine what to send inside via postMessage
		getHostReadyPayload: () => ({ visitorId: biVisitorId, svSession: sessionManager.getUserSession() }),
	}
	if (handleOauthToken && handleSocialLoginResponse) {
		props.onTokenMessage = (token: string, vendor: string, joinCommunityChecked: boolean = false) => {
			const joinCommunityStatus = joinCommunityChecked ? 'PUBLIC' : 'PRIVATE'
			return handleOauthToken(token, vendor, 'socialAuthComponent', joinCommunityStatus)
		}
		props.onBackendSocialLogin = handleSocialLoginResponse
	}

	return props
}

const CONTACT_INFO_SYSTEM_FIELDS: Record<string, Object> = {
	id: {},
	firstName: {},
	lastName: {},
	picture: {},
	emails: {},
	addresses: {},
	phones: {},
	labels: {},
}

const CONTACT_INFO_HIDDEN_SYSTEM_FIELDS: Record<string, Object> = {
	emailVerified: {},
	role: {},
	loginEmail: {},
	nickname: {},
	slug: {},
	language: {},
	status: {},
	creationDate: {},
	lastUpdateDate: {},
	lastLoginDate: {},
	profilePrivacyStatus: {},
}

const customFieldType = (value: any) => {
	if (_.isDate(value)) {
		return 'dateValue'
	} else if (Number.isInteger(value)) {
		return 'numValue'
	}
	return 'strValue'
}

export const serializeContactInfo = (rawContactInfo: Record<string, any>) =>
	Object.entries(rawContactInfo).reduce(
		(result: Record<string, any>, [key, value]) => {
			const systemField = CONTACT_INFO_SYSTEM_FIELDS[key]
			const hiddenField = CONTACT_INFO_HIDDEN_SYSTEM_FIELDS[key]
			if (systemField) {
				result[key] = value
			} else if (!hiddenField && key) {
				result.customFields.push({
					name: key,
					[customFieldType(value)]: value,
				})
			}
			return result
		},
		{ customFields: [] }
	)
