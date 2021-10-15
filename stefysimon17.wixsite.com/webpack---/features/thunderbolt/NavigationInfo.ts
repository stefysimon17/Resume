import { IPageWillMountHandler } from '@wix/thunderbolt-symbols'

export class NavigationInfo implements IPageWillMountHandler {
	private currentPageId: string

	constructor() {
		this.currentPageId = ''
	}

	async pageWillMount(pageId: string): Promise<void> {
		this.currentPageId = pageId
	}

	getCurrentPageId(): string {
		return this.currentPageId
	}
}
