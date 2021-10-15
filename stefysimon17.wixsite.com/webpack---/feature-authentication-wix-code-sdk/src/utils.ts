export const ERROR_CODES = {
	SM_CAPTCHA_REQUIRED: '-19971',
	SM_CAPTCHA_INVALID: '-19970',
}

export const CAPTCHA_ERROR_CODES = [ERROR_CODES.SM_CAPTCHA_REQUIRED, ERROR_CODES.SM_CAPTCHA_INVALID]

export const isCaptchaTokenRequired = (error: any) => {
	const errorCode = error?.details?.errorcode || error?.details?.errorCode
	return CAPTCHA_ERROR_CODES.includes(errorCode)
}
