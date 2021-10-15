"use strict";
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new(P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function(thisArg, body) {
    var _ = {
            label: 0,
            sent: function() {
                if (t[0] & 1) throw t[1];
                return t[1];
            },
            trys: [],
            ops: []
        },
        f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;

    function verb(n) {
        return function(v) {
            return step([n, v]);
        };
    }

    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [6, e];
            y = 0;
        } finally {
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
var __spreadArray = (this && this.__spreadArray) || function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createEagerComponentLoaders = exports.createLazyComponentLoaders = exports.createComponentLoader = exports.getComponentAssets = void 0;
var utils_1 = require("../utils");
var createException_1 = require("../createException");

function getComponentAssets(_a) {
    var resource = _a.resource,
        _b = _a.parts,
        parts = _b === void 0 ? {} : _b;
    var assets = [];
    var applyAssets = function(_resource) {
        var _a;
        if (_resource === null || _resource === void 0 ? void 0 : _resource.src) {
            if (_resource.src.js) {
                assets.push({
                    id: _resource.id,
                    url: _resource.src.js,
                    type: 'model',
                });
            }
            if (_resource.src.css) {
                assets.push({
                    url: _resource.src.css,
                    type: 'style',
                });
            }
            (_a = _resource.src.deps) === null || _a === void 0 ? void 0 : _a.forEach(function(dep) {
                assets.push({
                    url: dep,
                    dependency: true,
                    type: utils_1.isJS(dep) ? 'model' : 'style',
                });
            });
        }
    };
    applyAssets(resource);
    Object.keys(parts).forEach(function(partName) {
        applyAssets(parts[partName]);
    });
    return assets;
}
exports.getComponentAssets = getComponentAssets;

function createComponentLoader(_a) {
    var _this = this;
    var resource = _a.resource,
        _b = _a.parts,
        parts = _b === void 0 ? {} : _b,
        loadBundle = _a.loadBundle,
        statics = _a.statics;
    var loader = function(part) {
        return __awaiter(_this, void 0, void 0, function() {
            var tasks, componentPart, batchRequests, bundles, model;
            return __generator(this, function(_a) {
                switch (_a.label) {
                    case 0:
                        if (!resource.src.deps) return [3 /*break*/ , 2];
                        return [4 /*yield*/ , Promise.all(__spreadArray(__spreadArray([], resource.src.deps.filter(utils_1.isJS).map(function(dep) {
                            return loadBundle({
                                url: dep,
                            });
                        })), [
                            loadBundle({
                                assets: resource.src.deps.filter(utils_1.isCSS),
                            }),
                        ]))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        tasks = [];
                        if (part) {
                            componentPart = parts[part];
                            tasks.push(loadBundle({
                                id: componentPart.id,
                                url: componentPart.src.js,
                                assets: [componentPart.src.css],
                            }));
                        } else {
                            tasks.push(loadBundle({
                                id: resource.id,
                                url: resource.src.js,
                                assets: [resource.src.css],
                            }));
                            batchRequests = Object.keys(parts)
                                /**
                                 * get eager parts
                                 */
                                .filter(function(partName) {
                                    return parts[partName].batched;
                                });
                            batchRequests.forEach(function(partName) {
                                var batchedPart = parts[partName];
                                tasks.push(loadBundle({
                                    id: batchedPart.id,
                                    url: batchedPart.src.js,
                                    assets: [batchedPart.src.css],
                                }));
                            });
                        }
                        return [4 /*yield*/ , Promise.all(tasks)];
                    case 3:
                        bundles = _a.sent();
                        if (bundles.some(function(bundle) {
                                return !bundle || !bundle.components;
                            })) {
                            throw createException_1.createException(createException_1.RegistryErrorCode.NoComponentsAtComponentBundle);
                        }
                        model = Object.assign.apply(Object, __spreadArray([{}], bundles.map(function(bundle) {
                            return bundle ? bundle.components[resource.name] : {};
                        })));
                        return [2 /*return*/ , part ? model[part] : model];
                }
            });
        });
    };
    loader.isPartExist = function(part) {
        return part in parts;
    };
    loader.statics = statics;
    loader.assets = getComponentAssets({
        resource: resource,
        parts: parts
    });
    return loader;
}
exports.createComponentLoader = createComponentLoader;

function createLazyComponentLoaders(_a) {
    var manifest = _a.manifest,
        loadBundle = _a.loadBundle;
    var components = manifest.getComponents();
    var parts = manifest.getParts();
    var loaders = {};
    Object.keys(components).forEach(function(componentName) {
        loaders[componentName] = createComponentLoader({
            resource: components[componentName],
            parts: parts[componentName],
            loadBundle: loadBundle,
            statics: manifest.getStatics(componentName),
        });
    });
    return loaders;
}
exports.createLazyComponentLoaders = createLazyComponentLoaders;

function createEagerComponentLoaders(_a) {
    var manifest = _a.manifest,
        loadBundle = _a.loadBundle;
    return __awaiter(this, void 0, void 0, function() {
        var components, parts, resource, bundle, loaders;
        return __generator(this, function(_b) {
            switch (_b.label) {
                case 0:
                    components = manifest.getComponents();
                    parts = manifest.getParts();
                    resource = manifest.getHostBundleModel();
                    if (!resource.src.js) {
                        return [2 /*return*/ , {}];
                    }
                    return [4 /*yield*/ , loadBundle({
                        id: resource.id,
                        url: resource.src.js,
                        assets: [resource.src.css],
                    })];
                case 1:
                    bundle = _b.sent();
                    if (!bundle || !bundle.components) {
                        throw createException_1.createException(createException_1.RegistryErrorCode.NoComponentsAtHostBundle);
                    }
                    loaders = {};
                    Object.keys(bundle.components).forEach(function(componentName) {
                        var loader = (function() {
                            return Promise.resolve(bundle.components[componentName]);
                        });
                        loader.assets = getComponentAssets({
                            resource: components[componentName],
                            parts: parts[componentName],
                        });
                        loader.statics = manifest.getStatics(componentName);
                        loader.isPartExist = function() {
                            return true;
                        };
                        loaders[componentName] = loader;
                    });
                    return [2 /*return*/ , loaders];
            }
        });
    });
}
exports.createEagerComponentLoaders = createEagerComponentLoaders;
//# sourceMappingURL=createComponentLoaders.js.map