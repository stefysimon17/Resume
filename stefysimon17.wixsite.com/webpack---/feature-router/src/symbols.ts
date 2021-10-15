export const Router = Symbol('Router')
export const RoutingMiddleware = {
	Dynamic: Symbol('DynamicRoutingMiddleware'),
	Protected: Symbol('ProtectedRoutingMiddleware'),
	BlockingDialogs: Symbol('BlockingDialogsRoutingMiddleware'),
}
export const PageJsonFileNameMiddlewareSymbol = Symbol('PageJsonFileNameMiddleware')
export const CustomNotFoundPageMiddlewareSymbol = Symbol('CustomNotFoundPageMiddleware')
export const CustomUrlMiddlewareSymbol = Symbol('CustomUrlMiddleware')
export const RoutingLinkUtilsAPISymbol = Symbol('RoutingLinkUtilsAPI')
export const PopHistoryStateHandler = Symbol('PopHistoryStateHandler')
export const UrlChangeHandlerForPage = Symbol('UrlChangeHandlerForPage')
export const UrlHistoryManagerSymbol = Symbol('UrlHistoryManager')
export const ShouldNavigateHandlerSymbol = Symbol('ShouldNavigateHandler')
export const CommonNavigationClickHandlerSymbol = Symbol('CommonNavigationClickHandler')
export const RouterContextSymbol = Symbol('RouterContext')
export const RoutingValidationSymbol = Symbol('RoutingValidation')

export const name = 'router' as const
