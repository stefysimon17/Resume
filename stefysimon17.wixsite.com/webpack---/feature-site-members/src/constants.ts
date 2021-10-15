export const INTERACTIONS = {
	SOCIAL_APP_LOGIN: 'members-social-app-login',
	DEFAULT_LOGIN: 'members-default-login',
	CODE_LOGIN: 'members-code-login',
	CODE_SIGNUP: 'members-code-signup',
	DEFAULT_SIGNUP: 'members-default-signup',
	RESET_PASSWORD: 'members-reset-password',
	VERIFY_TOKEN: 'apply-session-token',
	EDITOR: {
		CODE_LOGIN: 'editor-members-code-login',
	},
}

export const DIALOGS = {
	Login: 'login',
	SignUp: 'register',
	ResetPasswordEmail: 'resetPasswordEmail',
	ResetPasswordNewPassword: 'resetPasswordNewPassword',
	Notification: 'notification',
	Credits: 'credits',
	PasswordProtected: 'enterPassword',
	EmailVerification: 'emailVerification',
	SentConfirmationEmail: 'sentConfirmationEmail',
	Welcome: 'welcome',
	NoPermissionsToPage: 'noPermissionsToPage',
}

export const NOTIFICATIONS = {
	Template: 'template',
	SiteOwner: 'siteowner',
	SignUp: 'register',
	ResetPasswordEmail: 'resetPasswordEmail',
	ResetPasswordNewPassword: 'resetPasswordNewPassword',
}

export enum PrivacyStatus {
	PUBLIC = 'PUBLIC',
	PRIVATE = 'PRIVATE',
	COMMUNITY = 'COMMUNITY',
}

export const ComponentType = 'SocialAuth'

export const AUTH_RESULT_REASON = {
	CANCELED: 'authentication canceled',
	ALREADY_LOGGED_IN: 'already logged in',
	SUCCESS: 'success',
}

const ERROR_CODES = {
	PASSWORD_RESETED: '-19973',
	WRONG_AUTH_DETAILS: '-19976',
	ACCESS_DENID: '-19956',
	VALIDATION_ERROR: '-19988',
	WAITING_APPROVAL: '-19958',
	UNKNOWN_ACCOUNT: '-19999',
	WRONG_PASSWORD: '-17005',
	EXISTING_EMAIL_ACCOUNT: '-19995',
	CLIENT_AUTH_FORBIDDEN: '-19974',
	EMAIL_NOT_PROVIDED: '-18880',
	CAPTCHA_REQUIRED: '-19971',
	CAPTCHA_INVALID: '-19970',
}

export const CAPTCHA_ERROR_CODES = [ERROR_CODES.CAPTCHA_REQUIRED, ERROR_CODES.CAPTCHA_INVALID]

export const LOGIN_ERROR_CODES = [
	ERROR_CODES.CLIENT_AUTH_FORBIDDEN,
	ERROR_CODES.PASSWORD_RESETED,
	ERROR_CODES.WRONG_AUTH_DETAILS,
	ERROR_CODES.ACCESS_DENID,
	ERROR_CODES.VALIDATION_ERROR,
	ERROR_CODES.WAITING_APPROVAL,
	ERROR_CODES.UNKNOWN_ACCOUNT,
	ERROR_CODES.WRONG_PASSWORD,
	...CAPTCHA_ERROR_CODES,
]

export const SIGN_UP_ERROR_CODES = [
	ERROR_CODES.CLIENT_AUTH_FORBIDDEN,
	ERROR_CODES.EXISTING_EMAIL_ACCOUNT,
	ERROR_CODES.VALIDATION_ERROR,
	ERROR_CODES.EMAIL_NOT_PROVIDED,
	...CAPTCHA_ERROR_CODES,
]

export const UNSUPPORTED_AGENTS_FOR_SOCIAL_AUTH = ['FBAV', 'FBAN', 'Instagram']
