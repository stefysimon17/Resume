import {
    isNode
} from 'browser-or-node';
export var setHeaders = function(customCacheTTL, isNodeEnvironmrnt) {
    if (isNodeEnvironmrnt === void 0) {
        isNodeEnvironmrnt = isNode;
    }
    var headers = {};
    if (customCacheTTL && isNodeEnvironmrnt) {
        headers['x-wix-site-assets-custom-cache'] = customCacheTTL;
    }
    return headers;
};