import {
    QUERY_SEPARATOR,
    QUERY_PARAM_SEPARATOR,
    QUERY_WHITELIST,
} from '../consts/consts';
/**
 * Sanitizes the given URL by leaving only supported query params.
 *
 * @param {String} url to sanitize
 */
export function sanitizeUrl(url) {
    if (typeof url === 'string') {
        var queryIndex = url.indexOf(QUERY_SEPARATOR);
        if (queryIndex !== -1) {
            var _a = url.split(QUERY_SEPARATOR),
                urlWithoutQuery = _a[0],
                query = _a[1];
            var sanitizedQuery = query
                .split(QUERY_PARAM_SEPARATOR)
                .filter(function(pair) {
                    return QUERY_WHITELIST.some(function(key) {
                        return pair.startsWith(key);
                    });
                })
                .join(QUERY_PARAM_SEPARATOR);
            if (sanitizedQuery) {
                return "" + urlWithoutQuery + QUERY_SEPARATOR + sanitizedQuery;
            }
            return urlWithoutQuery;
        }
        return url;
    }
    return undefined;
}