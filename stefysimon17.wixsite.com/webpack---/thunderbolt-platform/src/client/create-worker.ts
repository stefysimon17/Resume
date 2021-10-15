const {
	siteAssets: { clientTopology },
	siteFeatures,
	siteFeaturesConfigs: { platform },
	experiments,
} = window.viewerModel

const shouldCreateWebWorker = siteFeatures.includes('platform')

function createWorkerBlobUrl(workerUrl: string) {
	const blob = new Blob([`importScripts('${workerUrl}');`], { type: 'application/javascript' })
	return URL.createObjectURL(blob)
}

const createDomInteractivePromise = () =>
	new Promise<void>((resolve) => {
		document.addEventListener(
			'readystatechange',
			() => {
				if (document.readyState === 'interactive') {
					resolve()
				}
			},
			{ once: true }
		)
	})

async function createWorker() {
	const starMark = 'platform_create-worker started'
	performance.mark(starMark)

	const clientWorkerUrl = platform.clientWorkerUrl
	const url =
		clientWorkerUrl.startsWith('http://localhost:4200/') || clientWorkerUrl.startsWith('https://bo.wix.com/suricate/')
			? await createWorkerBlobUrl(platform.clientWorkerUrl)
			: clientWorkerUrl.replace(clientTopology.fileRepoUrl, '/_partials')
	if (experiments['specs.thunderbolt.platform_worker_on_dom_interactive']) {
		await createDomInteractivePromise()
	}
	const platformWorker = new Worker(url)

	platformWorker.postMessage({
		type: 'platformScriptsToPreload',
		appScriptsUrls: platform.appsScripts.urls,
		experiments, // TODO remove when merging specs.thunderbolt.fetchEvalInWorker
	})

	const endMark = 'platform_create-worker ended'
	performance.mark(endMark)
	performance.measure('Create Platform Web Worker', starMark, endMark)

	return platformWorker
}

export const platformWorkerPromise = shouldCreateWebWorker ? createWorker() : Promise.resolve()
