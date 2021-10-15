var __spreadArrays = (this && this.__spreadArrays) || function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var TWITTER_IDENTIFIERS = [
    'TWITTER_CARD',
    'TWITTER_TITLE',
    'TWITTER_DESCRIPTION',
    'TWITTER_IMAGE',
].reduce(function(acc, curr) {
    acc[curr] = curr;
    return acc;
}, {});
var IDENTIFIERS = __spreadArrays([
    'TITLE',
    'DESCRIPTION',
    'OG_TITLE',
    'OG_DESCRIPTION',
    'OG_IMAGE',
    'FB_ADMINS',
    'ROBOTS',
    'CANONICAL',
    'STRUCTURED_DATA',
    'OG_IMAGE_WIDTH',
    'OG_IMAGE_HEIGHT'
], Object.keys(TWITTER_IDENTIFIERS)).reduce(function(acc, curr) {
    acc[curr] = curr;
    return acc;
}, {});
var GENERAL_IDENTIFIERS = {
    LINK: 'LINK',
    OG_TAG: 'OG_TAG',
    SATANDARD_META: 'SATANDARD_META',
};
export {
    IDENTIFIERS,
    GENERAL_IDENTIFIERS,
    TWITTER_IDENTIFIERS
};