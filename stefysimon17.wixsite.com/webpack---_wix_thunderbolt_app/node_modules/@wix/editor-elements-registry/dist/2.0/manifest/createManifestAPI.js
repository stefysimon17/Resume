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
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createManifestAPI = void 0;
var editor_elements_conventions_1 = require("@wix/editor-elements-conventions");
var utils_1 = require("../utils");

function getDepsURLs(indexes, shared) {
    if (shared === void 0) {
        shared = [];
    }
    return indexes.map(function(index) {
        return shared[index];
    });
}

function createManifestAPI(manifest) {
    var buildComponentId = function(componentName, part) {
        return editor_elements_conventions_1.getBundleId({
            namespace: manifest.namespace,
            host: manifest.host,
            componentName: componentName,
            part: part,
        });
    };
    var buildHostId = function() {
        return editor_elements_conventions_1.getBundleId({
            namespace: manifest.namespace,
            host: manifest.host,
        });
    };
    var buildBatchId = function(batch) {
        return editor_elements_conventions_1.getBundleId({
            namespace: manifest.namespace,
            host: manifest.host,
            batch: batch,
        });
    };
    var withBaseURL = function(url) {
        return "" + manifest.baseURL + url;
    };

    function extractModelSources(urls, _a) {
        var _b = _a === void 0 ? {} : _a,
            componentName = _b.componentName,
            part = _b.part,
            batch = _b.batch;
        var model = {};
        var prefix = editor_elements_conventions_1.getBundleId({
            namespace: manifest.namespace,
            host: manifest.host,
            componentName: componentName,
            part: part,
            batch: batch,
        });
        urls.forEach(function(url) {
            if (Array.isArray(url)) {
                model.deps = getDepsURLs(url, manifest.shared).map(withBaseURL);
            } else {
                if (utils_1.isJS(url)) {
                    model.js = withBaseURL(prefix + "." + url);
                } else if (utils_1.isCSS(url)) {
                    model.css = withBaseURL(prefix + "." + url);
                }
            }
        });
        return model;
    }
    return {
        getManifest: function() {
            return manifest;
        },
        getEnvironment: function() {
            var _a, _b;
            return {
                hot: ((_a = manifest.environment) === null || _a === void 0 ? void 0 : _a.hot) ?
                    withBaseURL("hot." + manifest.environment.hot) :
                    undefined,
                runtime: ((_b = manifest.environment) === null || _b === void 0 ? void 0 : _b.runtime) ?
                    withBaseURL("webpack-runtime." + manifest.environment.runtime) :
                    undefined,
            };
        },
        getNamespace: function() {
            return manifest.namespace;
        },
        getBaseUrl: function() {
            return manifest.baseURL;
        },
        getStatics: function(componentName) {
            var _a;
            var statics = (_a = manifest.statics) !== null && _a !== void 0 ? _a : {};
            return __assign(__assign({}, (manifest.libraryStatics || {})), (componentName ? statics[componentName] : {}));
        },
        getLibraryStatics: function() {
            var _a;
            return (_a = manifest.libraryStatics) !== null && _a !== void 0 ? _a : {};
        },
        getHostBundleModel: function() {
            return {
                name: manifest.host,
                id: buildHostId(),
                src: extractModelSources(manifest.model || []),
            };
        },
        getLibraryAssets: function() {
            var _a, _b;
            return ((_b = (_a = manifest.assets) === null || _a === void 0 ? void 0 : _a.map(function(_a) {
                var type = _a[0],
                    url = _a[1];
                return {
                    url: withBaseURL(url),
                    type: type,
                    extension: utils_1.getExtension(url),
                };
            })) !== null && _b !== void 0 ? _b : []);
        },
        getParts: function() {
            var _a, _b;
            var parts = {};
            Object.keys((_a = manifest.parts) !== null && _a !== void 0 ? _a : {}).forEach(function(componentName) {
                parts[componentName] = {};
                Object.keys(manifest.parts[componentName]).forEach(function(part) {
                    var urls = manifest.parts[componentName][part];
                    parts[componentName][part] = {
                        id: buildComponentId(componentName, part),
                        src: extractModelSources(urls, {
                            componentName: componentName,
                            part: part,
                        }),
                    };
                });
            });
            Object.entries((_b = manifest.batches) !== null && _b !== void 0 ? _b : {}).forEach(function(_a) {
                var _b, _c;
                var batchId = _a[0],
                    batch = _a[1];
                var isBundlesConcatenated = batch.url_v2 && batch.url_v2.length;
                var url = (Object.keys(batch.url_v2 || []).length ? batch.url_v2 : batch.url);
                var src = extractModelSources(url, {
                    part: isBundlesConcatenated ? batchId : undefined,
                    batch: !isBundlesConcatenated ? batchId : undefined,
                });
                (_b = batch.parts) === null || _b === void 0 ? void 0 : _b.forEach(function(_a) {
                    var part = _a[0],
                        components = _a.slice(1);
                    components.forEach(function(name) {
                        if (!parts[name]) {
                            parts[name] = {};
                        }
                        parts[name][part] = {
                            id: buildBatchId(batchId),
                            src: src,
                            batched: true,
                        };
                    });
                });
                (_c = batch.components) === null || _c === void 0 ? void 0 : _c.forEach(function(name) {
                    var _a;
                    (_a = batch.parts) === null || _a === void 0 ? void 0 : _a.forEach(function(_a) {
                        var part = _a[0];
                        if (!parts[name]) {
                            parts[name] = {};
                        }
                        parts[name][part] = {
                            id: buildBatchId(batchId),
                            src: src,
                            batched: true,
                        };
                    });
                });
            });
            return parts;
        },
        getComponents: function() {
            var _a, _b;
            var components = {};
            Object.keys((_a = manifest.components) !== null && _a !== void 0 ? _a : {}).forEach(function(componentName) {
                var urls = manifest.components[componentName];
                components[componentName] = {
                    id: buildComponentId(componentName),
                    name: componentName,
                    src: extractModelSources(urls, {
                        componentName: componentName
                    }),
                };
            });
            Object.entries((_b = manifest.batches) !== null && _b !== void 0 ? _b : {}).forEach(function(_a) {
                var _b;
                var batchId = _a[0],
                    batch = _a[1];
                var isBundlesConcatenated = batch.url_v2 && batch.url_v2.length;
                var url = (Object.keys(batch.url_v2 || []).length ? batch.url_v2 : batch.url);
                var src = extractModelSources(url, {
                    part: isBundlesConcatenated ? batchId : undefined,
                    batch: !isBundlesConcatenated ? batchId : undefined,
                });
                (_b = batch.components) === null || _b === void 0 ? void 0 : _b.forEach(function(componentName) {
                    components[componentName] = {
                        id: buildBatchId(batchId),
                        name: componentName,
                        src: src,
                    };
                });
            });
            return components;
        },
    };
}
exports.createManifestAPI = createManifestAPI;
//# sourceMappingURL=createManifestAPI.js.map