// expose externals (lodash, react, react dom, ...) libs on the window for chunks to be able to import them before they are loaded

const { lodash, react, reactDOM } = (window.externalsRegistry = {
	lodash: {} as typeof window.externalsRegistry['lodash'],
	react: {} as typeof window.externalsRegistry['react'],
	reactDOM: {} as typeof window.externalsRegistry['reactDOM'],
})

lodash.loaded = new Promise((resolve) => {
	lodash.onload = resolve
})

// @ts-ignore
window.reactDOMReference = window.ReactDOM = { loading: true }
reactDOM.loaded = new Promise((resolve) => {
	reactDOM.onload = () => {
		// if a chunk that is dependent on react-dom was evaluated prior to evaluating react-dom,
		// we need to override the stale reactDOMReference this chunk holds
		// with window.ReactDOM which is overridden by react-dom evaluation.
		Object.assign(window.reactDOMReference, window.ReactDOM, window.preactCompat, { loading: false })
		resolve()
	}
})

// @ts-ignore
window.reactReference = window.React = { loading: true }
react.loaded = new Promise((resolve) => {
	react.onload = () => {
		// if a chunk that is dependent on react was evaluated prior to evaluating react,
		// we need to override the stale reactReference this chunk holds
		// with window.React which is overridden by react evaluation.
		Object.assign(window.reactReference, window.React, window.preactCompat, { loading: false })
		resolve()
	}
})

window.reactAndReactDOMLoaded = Promise.all([react.loaded, reactDOM.loaded])
