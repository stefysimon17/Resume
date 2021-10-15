var __spreadArrays = (this && this.__spreadArrays) || function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import {
    isAbsoluteUrl
} from './is-absolute-url';
import {
    extractImageNameFromWixMediaUrl
} from './extract-image-name-from-wix-media-url';
var buildImageName = function(_a) {
    var name = _a.name,
        extension = _a.extension;
    return typeof name === 'string' ?
        encodeURIComponent(__spreadArrays([
            name
        ], (extension && !name.includes('.') ? ['.', extension] : [])).join('')) :
        '';
};
var extractExtension = function(url) {
    return typeof url === 'string' ? url.split('.').pop().toLocaleLowerCase() : '';
};
var getQualityParam = function(_a) {
    var width = _a.width,
        height = _a.height,
        extension = _a.extension;
    if (['jpg', 'jpeg', 'jpe'].includes(extension)) {
        var HIGH_QUALITY_RESOLUTION = 1400 * 1400;
        var MEDIUM_QUALITY_RESOLUTION = 600 * 600;
        var dimension = width * height;
        var quality = dimension > HIGH_QUALITY_RESOLUTION ?
            90 :
            dimension > MEDIUM_QUALITY_RESOLUTION ?
            85 :
            80;
        return ",q_" + quality;
    }
    return '';
};
/**
 * Following logic from ImageClientSDK https://github.com/wix-private/santa-core/tree/master/image-client-api
 */
export function buildOgImagePreviewUrl(_a) {
    var url = _a.url,
        width = _a.width,
        height = _a.height,
        _b = _a.method,
        method = _b === void 0 ? 'fit' : _b,
        name = _a.name;
    var urlOrName = url;
    if (!urlOrName) {
        return url || '';
    }
    if (isAbsoluteUrl(urlOrName)) {
        urlOrName = extractImageNameFromWixMediaUrl(urlOrName);
    }
    if (!urlOrName) {
        return url;
    }
    var extension = extractExtension(urlOrName);
    var imageName = buildImageName({
        name: name,
        extension: extension
    }) || urlOrName;
    var quality = getQualityParam({
        width: width,
        height: height,
        extension: extension
    });
    var suffix = ['jpg', 'jpeg', 'jpe', 'png'].includes(extension) &&
        method &&
        width &&
        height ?
        "/v1/" + method + "/w_" + width + ",h_" + height + ",al_c" + quality + "/" + imageName :
        '';
    return "https://static.wixstatic.com/media/" + urlOrName + suffix;
}
export function buildOgImagePreview(url, width, height, method) {
    return buildOgImagePreviewUrl({
        url: url,
        width: width,
        height: height,
        method: method
    });
}