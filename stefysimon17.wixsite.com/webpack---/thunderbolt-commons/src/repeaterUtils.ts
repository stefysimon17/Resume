export const REPEATER_DELIMITER = '__'

export const getDisplayedId = (originalId: string, itemId: string): string =>
	`${originalId}${REPEATER_DELIMITER}${itemId}`

export const getFullId = (id: string): string => id.split(REPEATER_DELIMITER)[0]

export const getItemId = (id: string): string => id.split(REPEATER_DELIMITER)[1]

export const isDisplayedOnly = (id: string): boolean => getFullId(id) !== id

export const isRepeater = (compType: string): boolean => compType.split('.').pop() === 'Repeater'
