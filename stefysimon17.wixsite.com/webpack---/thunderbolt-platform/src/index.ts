import { createLoaders } from './loader'
import PlatformWorkerInitializer from './client/platformWorkerInitializer'

const { site, page } = createLoaders(PlatformWorkerInitializer)
export { site, page }
