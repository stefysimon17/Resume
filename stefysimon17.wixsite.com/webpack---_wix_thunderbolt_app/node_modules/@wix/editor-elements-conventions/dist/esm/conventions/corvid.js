export var corvidBundlesConfig = {
    parts: false,
    components: true,
    host: true,
};
export var corvidConventions = {
    getComponentName: function(_a) {
        var componentName = _a.componentName;
        return componentName;
    },
    patterns: [{
        part: 'sdk',
        path: '{,*/}%ComponentName%/corvid/%ComponentName%.corvid.ts',
    }, ],
};
//# sourceMappingURL=corvid.js.map