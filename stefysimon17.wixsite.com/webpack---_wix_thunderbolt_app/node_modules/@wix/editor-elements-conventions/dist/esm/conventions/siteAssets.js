export var siteAssetsBundlesConfig = {
    parts: false,
    components: false,
    host: true,
};
export var siteAssetsConventions = {
    getComponentName: function(_a) {
        var componentName = _a.componentName;
        return componentName;
    },
    patterns: [{
        part: 'mapper',
        path: '{,*/}%ComponentName%/viewer/%ComponentName%.mapper.ts',
    }, ],
};
//# sourceMappingURL=siteAssets.js.map