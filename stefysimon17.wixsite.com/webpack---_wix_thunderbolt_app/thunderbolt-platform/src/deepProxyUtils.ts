export const createDeepProxy = <T extends Function>(handle: T, path: Array<string> = []): Function => {
	const memoizedValue: { [key: string]: Function } = {}

	const apply = (target: T, thisArg: any, args: Array<any>) => {
		return target(path)(...args)
	}

	const builtInMethods: { [key: string]: Function } = {
		apply: (thisArg: any, args: Array<any>) => {
			return apply(handle, thisArg, args)
		},
		bind: (thisArg: any, ...argsToBind: any) => {
			return (...args: any) => {
				return apply(handle, thisArg, [...argsToBind, ...args])
			}
		},
		call: (thisArg: any, ...args: any) => {
			return apply(handle, thisArg, [...args])
		},
	}

	return new Proxy(handle, {
		get: (target, prop: string) => {
			if (prop in builtInMethods) {
				return builtInMethods[prop]
			}
			if (memoizedValue[prop]) {
				return memoizedValue[prop]
			}
			memoizedValue[prop] = createDeepProxy(handle, [...path, prop])
			return memoizedValue[prop]
		},
		apply,
	})
}
