var __assign = (this && this.__assign) || function() {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import {
    setHeaders
} from './setHeaders';
import {
    isNode
} from 'browser-or-node';
export var SiteAssetsServerHttpHandlerBuilder = function(siteAssetsServerResponseBuilder) {
    var errorMessage = function(status, message) {
        return "server response: status: " + status + ", message: " + message;
    };
    var rejectMessage = function(status, data) {
        return errorMessage(status, data.message);
    };
    var backupErrorMessage = function(rawHttpResponse) {
        return Promise.resolve(errorMessage(rawHttpResponse.status, rawHttpResponse.statusText));
    };
    var build = function(siteAssetsUrl, timeout, customCacheTTL) {
        var headers = setHeaders(customCacheTTL, isNode);
        return {
            requestUrl: siteAssetsUrl,
            requestInit: __assign({
                headers: headers,
                method: 'GET'
            }, (timeout ? {
                timeout: timeout
            } : {})),
            transformResponse: function(httpResponse) {
                return siteAssetsServerResponseBuilder.build(httpResponse);
            },
            rejectMessage: rejectMessage,
            extractErrorMessage: function(siteAssetsHttpResponse) {
                var rawHttpResponse = siteAssetsHttpResponse.rawHttpResponse;
                if (rawHttpResponse.status == 500) {
                    try {
                        return rawHttpResponse.json()
                            .then(function(siteAssetsServerError) {
                                return rejectMessage(rawHttpResponse.status, siteAssetsServerError);
                            });
                    } catch (err) {
                        return backupErrorMessage(rawHttpResponse);
                    }
                }
                return backupErrorMessage(rawHttpResponse);
            }
        };
    };
    return {
        build: build
    };
};