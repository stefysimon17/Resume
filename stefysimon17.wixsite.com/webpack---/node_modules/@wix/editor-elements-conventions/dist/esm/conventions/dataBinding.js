export var dataBindingBundlesConfig = {
    parts: false,
    components: true,
    host: true,
};
export var dataBindingConventions = {
    getComponentName: function(_a) {
        var componentName = _a.componentName;
        return "$w." + componentName;
    },
    patterns: [{
        part: 'dataBindingPanel',
        path: '{,*/}editor/panels/dataBinding/%ComponentName%.dataBindingPanel.ts',
    }, ],
};
//# sourceMappingURL=dataBinding.js.map