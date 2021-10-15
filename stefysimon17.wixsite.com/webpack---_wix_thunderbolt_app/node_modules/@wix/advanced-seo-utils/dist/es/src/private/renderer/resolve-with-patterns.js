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
    applyOgImageModifications
} from '../utils/build-og-image';
import {
    resolvePayload
} from './resolve-payload';
import {
    resolveIsIndexable
} from './utils/resolve-is-indexable';
import {
    resolveStructuredData
} from '../tags/structured-data/resolve-structured-data';
import {
    sort
} from './sort';
import {
    getLink
} from './utils/get-link';
import {
    fillInPatternBlob
} from '../patterns/fill-in-pattern-blob';
import adapter from '../item-types/static-page/adapter-static-page';
import {
    removeBlackListedTags
} from './utils/remove-black-listed-tags';
import {
    applyOptions
} from '../options/apply-options';
import {
    resolveTwitterImage
} from '../utils/resolve-twitter-image';
import {
    formatRobotsTagForRendering
} from '../tags/robots-tag/robots-tag';
export function resolveWithPatterns(payload, context, options) {
    if (options === void 0) {
        options = {
            logError: function() {}
        };
    }
    var result = resolvePayload(payload, options);
    var contextWithOptions = __assign(__assign({}, context), applyOptions(result.options));
    result.tags = resolveStructuredData(result.tags, contextWithOptions);
    result.tags = resolveIsIndexable(result.tags, contextWithOptions);
    result.tags = result.tags
        .concat(getLink(contextWithOptions, adapter.IDs.NEXT, 'next'))
        .concat(getLink(contextWithOptions, adapter.IDs.PREV, 'prev'));
    result = fillInPatternBlob(result, contextWithOptions);
    result.tags = applyOgImageModifications(result.tags);
    result.tags = resolveTwitterImage(result.tags);
    result.tags = removeBlackListedTags(result.tags);
    result.tags = formatRobotsTagForRendering(result.tags);
    result.tags = sort(result.tags);
    return result;
}