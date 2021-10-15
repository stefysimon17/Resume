import { cashierServiceUrl } from './openModalConfig'

export const getPaymentResults = (paymentId: string, appInstance: string) => {
	return fetch(`${cashierServiceUrl}/_api/paymentResults/${paymentId}`, {
		headers: {
			Authorization: appInstance,
		},
	})
		.then((res) => res.json())
		.catch(() => {
			return {
				payment: {
					id: paymentId,
				},
				status: 'Undefined',
				transactionId: null,
			}
		})
}
