"use strict";
var __spreadArray = (this && this.__spreadArray) || function(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getComponentsModelCSSAssets = exports.getComponentsModelJSAssets = exports.filterComponentsModelCSSAssets = exports.filterComponentsModelJSAssets = exports.getComponentsAssets = exports.getComponentAssetsOrder = void 0;

function getComponentAssetsOrder(assets) {
    return __spreadArray(__spreadArray([], assets.filter(function(asset) {
        return asset.dependency;
    })), assets.filter(function(asset) {
        return !asset.dependency;
    }));
}
exports.getComponentAssetsOrder = getComponentAssetsOrder;

function getComponentsAssets(loaders, componentNames) {
    return componentNames.reduce(function(acc, componentName) {
        /**
         * check if asset's url was already added
         * for cases when components are loaded within batch
         */
        var componentAssets = loaders[componentName].assets.filter(function(asset) {
            return !acc.find(function(existingAsset) {
                return existingAsset.url === asset.url;
            });
        });
        return __spreadArray(__spreadArray([], acc), componentAssets);
    }, []);
}
exports.getComponentsAssets = getComponentsAssets;

function filterComponentsModelJSAssets(assets) {
    return assets.filter(function(asset) {
        return asset.type === 'model';
    });
}
exports.filterComponentsModelJSAssets = filterComponentsModelJSAssets;

function filterComponentsModelCSSAssets(assets) {
    return assets.filter(function(asset) {
        return asset.type === 'style';
    });
}
exports.filterComponentsModelCSSAssets = filterComponentsModelCSSAssets;

function getComponentsModelJSAssets(loaders, componentNames) {
    return getComponentAssetsOrder(filterComponentsModelJSAssets(getComponentsAssets(loaders, componentNames)));
}
exports.getComponentsModelJSAssets = getComponentsModelJSAssets;

function getComponentsModelCSSAssets(loaders, componentNames) {
    return getComponentAssetsOrder(filterComponentsModelCSSAssets(getComponentsAssets(loaders, componentNames)));
}
exports.getComponentsModelCSSAssets = getComponentsModelCSSAssets;
//# sourceMappingURL=assets.js.map