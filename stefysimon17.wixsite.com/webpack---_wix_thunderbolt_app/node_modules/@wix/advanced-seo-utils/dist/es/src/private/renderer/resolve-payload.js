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
    merge
} from './merge';
export function resolvePayload(payload, methodOptions) {
    if (methodOptions === void 0) {
        methodOptions = {
            logError: function() {}
        };
    }
    var _a = (Array.isArray(payload) ? payload : []).reduce(function(acc, curr) {
            acc.tags = merge(acc.tags, curr === null || curr === void 0 ? void 0 : curr.tags, methodOptions);
            acc.options = __assign(__assign({}, acc.options), curr === null || curr === void 0 ? void 0 : curr.options);
            return acc;
        }, {
            tags: [],
            options: {}
        }),
        tags = _a.tags,
        options = _a.options;
    return __assign({
        tags: tags
    }, (Object.keys(options).length ? {
        options: options
    } : {}));
}