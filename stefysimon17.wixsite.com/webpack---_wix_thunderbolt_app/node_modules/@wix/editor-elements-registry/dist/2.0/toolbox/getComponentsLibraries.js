"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getComponentsLibraries = exports.getComponentsLibrariesFromURL = exports.whitelist = void 0;
var getComponentsLibrariesFromURL_1 = require("./getComponentsLibrariesFromURL");
Object.defineProperty(exports, "getComponentsLibrariesFromURL", {
    enumerable: true,
    get: function() {
        return getComponentsLibrariesFromURL_1.getComponentsLibrariesFromURL;
    }
});
/**
 * This is a temp source of truth until a better alternative is supplied via DevCenter or something similar
 */
exports.whitelist = [{
        artifactId: 'editor-elements',
        namespace: 'wixui',
    },
    {
        artifactId: 'editor-elements',
        namespace: 'dsgnsys',
    },
];
/**
 * Will return list of components libraries with actual urls to each one of them.
 * In case when "serviceTopology" is not provided a whitelist of libraries
 * without urls will be returned
 */
var getComponentsLibraries = function(serviceTopology, url, prefix) {
    var urlLibraries = [];
    if (url) {
        urlLibraries.push.apply(urlLibraries, getComponentsLibrariesFromURL_1.getComponentsLibrariesFromURL(url, prefix));
    }
    if (!serviceTopology) {
        return __spreadArray([], urlLibraries);
    }
    var topologyLibraries = exports.whitelist.reduce(function(acc, lib) {
        var artifactId = lib.artifactId;
        var libraryEntryInTopology = serviceTopology[artifactId] ||
            serviceTopology.scriptsLocationMap[artifactId];
        if (typeof libraryEntryInTopology === 'string') {
            acc.push(__assign(__assign({}, lib), {
                url: libraryEntryInTopology
            }));
        }
        return acc;
    }, []);
    return __spreadArray(__spreadArray([], topologyLibraries), urlLibraries);
};
exports.getComponentsLibraries = getComponentsLibraries;
//# sourceMappingURL=getComponentsLibraries.js.map