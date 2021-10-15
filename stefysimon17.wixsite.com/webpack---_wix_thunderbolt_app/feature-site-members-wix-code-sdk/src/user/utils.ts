export const apis = {
	currentUserDetails: (baseUrl: string) => `${baseUrl}/api/wix-sm/v1/members/current`,
	currentUserRolesUrl: (baseUrl: string) =>
		`${baseUrl}/_api/members-groups-web/v1/groups/users/current?include_implicit_groups=true&groupType=role`,
	currentUserPlansUrl: (baseUrl: string) =>
		`${baseUrl}/_api/members-groups-web/v1/groups/users/current?include_implicit_groups=true&groupType=plan`,
	plansMembershipsUrl: (baseUrl: string, userId: string) =>
		`${baseUrl}/_api/members-groups-web/v1/groups/users/${userId}/memberships?type=plan`,
	sendUserEmailApi: (baseUrl: string) => `${baseUrl}/_api/shoutout/v1/emailMember`,
}

export const formatPlatformizedHttpError = function (response: any) {
	const status = response.status,
		responseText = response?.text()
	if (!status && !responseText) {
		return response
	}
	if (status === 400) {
		return 'Bad Request: please check the user inputs.'
	}
	if (status === 404) {
		return 'Not Found: the requested item no longer exists.'
	}
	let errorMessage
	try {
		errorMessage = JSON.parse(responseText).message
	} catch (e) {
		/* do nothing */
	}
	return (errorMessage || 'unknown failure') + ' (' + (status || 0) + ')'
}

export const handleErrors = (response: Response) => {
	if (!response.ok) {
		Promise.reject(response)
	}
	return response.json()
}

export const serializeMemberRoles = (rawRoles: any) => {
	if (!rawRoles?.groups) {
		return []
	}
	return rawRoles.groups.map((role: any) => {
		return { name: role.title, description: role.description }
	})
}

export const onAuthHandler = (callbackArguments?: any) => (handler: any) => {
	try {
		handler(callbackArguments)
	} catch (e) {
		console.error(e)
	}
}
