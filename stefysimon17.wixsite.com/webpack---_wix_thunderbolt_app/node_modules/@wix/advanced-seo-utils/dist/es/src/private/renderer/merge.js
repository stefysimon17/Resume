var _a;
import {
    GENERAL_IDENTIFIERS,
    IDENTIFIERS
} from '../types/Identifiers';
import {
    identify
} from './utils/identify';
import {
    getSimplifiedTagLabel
} from '../tags/advanced/get-simplified-tag-label';
import {
    filterDuplicateCustomTags
} from '../tags/filters/filter-duplicate-custom-tags';
import {
    mergeRobotsTags
} from '../tags/robots-tag/robots-tag';
import {
    getTagsByIdentifier
} from '../tags/values/get-by-identifier';
var getIdentifier = function(tag, _a) {
    var _b;
    var _c = (_a === void 0 ? {} : _a).logError,
        logError = _c === void 0 ? function() {} : _c;
    var identifier = identify(tag);
    if (identifier === IDENTIFIERS.STRUCTURED_DATA) {
        if ((_b = tag === null || tag === void 0 ? void 0 : tag.meta) === null || _b === void 0 ? void 0 : _b.schemaType) {
            return tag.meta.schemaType + " - " + tag.meta.selectedVariant;
        }
        try {
            var jsonData = JSON.parse(tag.children);
            var scriptType = jsonData && jsonData['@type'];
            return identifier + " - " + scriptType;
        } catch (error) {
            logError({
                error: error,
                data: {
                    value: tag.children
                }
            });
        }
    }
    if (!identifier && tag.props && !tag.custom) {
        var simplifiedTagLabel = getSimplifiedTagLabel(tag);
        var simplifiedTagIdentifier = getSimplifiedTagIdentifier(simplifiedTagLabel);
        if (simplifiedTagIdentifier) {
            return simplifiedTagIdentifier;
        }
    }
    return identifier;
};
var getSimplifiedTagIdentifier = function(simplifiedTagLabel) {
    var simplifiedIdentifier = Object.values(IDENTIFIERS).find(function(identifier) {
        return simplifiedTagLabel === identifier.toLowerCase();
    });
    return simplifiedIdentifier || simplifiedTagLabel;
};
var identifierToMergeLogic = (_a = {}, _a[IDENTIFIERS.ROBOTS] = mergeRobotsTags, _a);
export function merge(allTags, currentTags, options) {
    if (options === void 0) {
        options = {
            logError: function() {}
        };
    }
    var tags = [];
    var uniqueTagCache = new Map();
    allTags = Array.isArray(allTags) ? allTags : [];
    currentTags = Array.isArray(currentTags) ? currentTags : [];
    var tagsWithoutDuplicateCustom = filterDuplicateCustomTags(allTags, currentTags);
    var mergedTags = []
        .concat(currentTags.some(function(tag) {
                return tag.allowMultiple;
            }) ?
            tagsWithoutDuplicateCustom.filter(function(tag) {
                return !tag.allowMultiple;
            }) :
            tagsWithoutDuplicateCustom)
        .concat(currentTags)
        .reverse();
    for (var _i = 0, mergedTags_1 = mergedTags; _i < mergedTags_1.length; _i++) {
        var tag = mergedTags_1[_i];
        var identifier = getIdentifier(tag, options);
        var allowMultiple = Boolean(tag.allowMultiple);
        var isCached = uniqueTagCache.has(identifier);
        if (allowMultiple || !isCached) {
            var specificMergeLogic = identifierToMergeLogic[identifier];
            if (specificMergeLogic) {
                var matchedTags = getTagsByIdentifier(mergedTags, identifier);
                if (matchedTags.length) {
                    var mergedTag = matchedTags.reduce(specificMergeLogic);
                    tags.push(mergedTag);
                }
            } else {
                tags.push(tag);
            }
            var isGeneralIdentifier = GENERAL_IDENTIFIERS[identifier];
            if (!allowMultiple && identifier && !isGeneralIdentifier) {
                uniqueTagCache.set(identifier);
            }
        }
    }
    return tags.reverse();
}