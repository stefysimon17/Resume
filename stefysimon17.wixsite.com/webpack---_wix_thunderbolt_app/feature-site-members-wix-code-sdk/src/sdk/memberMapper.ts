import { Member } from '@wix/ambassador-members-ng-api/http'
import { VeloMember } from '../types'

export const toVeloMember = (member?: Member): VeloMember | undefined => {
	if (member === undefined) {
		return undefined
	}
	return {
		_id: member.id,
		contactId: member.contactId,
		loginEmail: member.loginEmail,
		profile: member.profile,
		contactDetails: member.contact,
		activityStatus: member.activityStatus,
		privacyStatus: member.privacyStatus,
		status: member.status,
		lastLoginDate: member.lastLoginDate,
		_createdDate: member.createdDate,
		_updatedDate: member.updatedDate,
	}
}
