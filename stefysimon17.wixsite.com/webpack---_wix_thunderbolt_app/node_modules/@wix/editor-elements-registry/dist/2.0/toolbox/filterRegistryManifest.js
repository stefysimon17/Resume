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
exports.filterRuntime = exports.filterRegistryManifest = void 0;
var utils_1 = require("../utils");
var NOT_USED_SHARED_URL_EMPTY_SYMBOL = '-';

function filterStatics(statics, componentNames) {
    if (!statics) {
        return null;
    }
    return Object.keys(statics)
        .filter(function(componentName) {
            return componentNames.includes(componentName);
        })
        .reduce(function(acc, componentName) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[componentName] = statics[componentName], _a));
        }, {});
}

function filterParts(parts, componentNames) {
    var deps = [];
    if (!parts) {
        return {
            parts: null,
            deps: [],
        };
    }
    var filtered = Object.keys(parts)
        .filter(function(componentName) {
            return componentNames.includes(componentName);
        })
        .reduce(function(acc, componentName) {
            /**
             * Commented since manifest parts don't support shared bundles feature
             */
            // Object.keys(parts[componentName]).forEach(part => {
            //   const urls = parts[componentName][part];
            //   deps.push(
            //     ...(flat(
            //       urls.filter(indexes => Array.isArray(indexes)),
            //     ) as Array<number>),
            //   );
            // });
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[componentName] = parts[componentName], _a));
        }, {});
    return {
        parts: filtered,
        deps: deps,
    };
}

function filterComponents(components, componentNames) {
    if (!components) {
        return {
            components: null,
            deps: [],
        };
    }
    var deps = [];
    var filtered = Object.keys(components).reduce(function(acc, componentType) {
        var _a;
        if (componentNames.includes(componentType)) {
            deps.push.apply(deps, utils_1.flat(components[componentType].filter(function(indexes) {
                return Array.isArray(indexes);
            })));
            return __assign(__assign({}, acc), (_a = {}, _a[componentType] = components[componentType], _a));
        }
        return acc;
    }, {});
    return {
        components: filtered,
        deps: deps,
    };
}

function filterBatches(batches, componentNames) {
    if (!batches) {
        return {
            batches: null,
            deps: [],
        };
    }
    var deps = [];
    var filtered = Object.keys(batches).reduce(function(acc, batchName) {
        var _a;
        var batch = batches[batchName];
        var batchComponents = batch.components ?
            batch.components.filter(function(component) {
                return componentNames.includes(component);
            }) :
            [];
        var batchParts = batch.parts ?
            batch.parts.filter(function(_a) {
                var _ = _a[0],
                    partComponents = _a.slice(1);
                return partComponents.some(function(component) {
                    return componentNames.includes(component);
                });
            }) :
            [];
        if (batchComponents.length || (batchParts === null || batchParts === void 0 ? void 0 : batchParts.length)) {
            deps.push.apply(deps, utils_1.flat(batch.url.filter(function(indexes) {
                return Array.isArray(indexes);
            })));
            return __assign(__assign({}, acc), (_a = {}, _a[batchName] = __assign(__assign({}, batch), {
                components: batchComponents,
                parts: batchParts
            }), _a));
        }
        return acc;
    }, {});
    return {
        batches: filtered,
        deps: deps,
    };
}

function filterRegistryManifest(manifest, componentNames) {
    var _a = filterComponents(manifest.components, componentNames),
        components = _a.components,
        componentDeps = _a.deps;
    var _b = filterBatches(manifest.batches, componentNames),
        batches = _b.batches,
        batchesDeps = _b.deps;
    var _c = filterParts(manifest.parts, componentNames),
        parts = _c.parts,
        partsDeps = _c.deps;
    var statics = filterStatics(manifest.statics, componentNames);
    var deps = __spreadArray(__spreadArray(__spreadArray([], componentDeps), batchesDeps), partsDeps);
    var shared = manifest.shared ?
        manifest.shared.map(function(url, index) {
            return deps.includes(index) ? url : NOT_USED_SHARED_URL_EMPTY_SYMBOL;
        }) :
        [];
    return __assign(__assign({}, manifest), {
        components: components ? components : {},
        batches: batches ? batches : {},
        statics: statics ? statics : {},
        parts: parts ? parts : {},
        shared: shared.every(function(url) {
                return url === NOT_USED_SHARED_URL_EMPTY_SYMBOL;
            }) ?
            [] :
            shared
    });
}
exports.filterRegistryManifest = filterRegistryManifest;

function filterRuntime(runtime, usedComponents) {
    if (!runtime) {
        return null;
    }
    return {
        libraries: runtime.libraries.map(function(manifest) {
            return filterRegistryManifest(manifest, usedComponents);
        }),
    };
}
exports.filterRuntime = filterRuntime;
//# sourceMappingURL=filterRegistryManifest.js.map