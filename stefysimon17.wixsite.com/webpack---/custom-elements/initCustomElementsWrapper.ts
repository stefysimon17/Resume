import { initCustomElements } from './initCustomElements'

const { experiments, media, requestUrl } = window.viewerModel
initCustomElements({ experiments, media, requestUrl })
