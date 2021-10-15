import {
    getReactHOTComposeFunction
} from '../presets';
export var thunderboltBundlesConfig = {
    parts: false,
    components: true,
    host: true,
};
export var thunderboltConventions = {
    getComponentName: function(_a) {
        var componentName = _a.componentName,
            placeholders = _a.placeholders;
        if (placeholders.SkinName) {
            return componentName + "_" + placeholders.SkinName;
        }
        return componentName;
    },
    part: 'component',
    path: '{,*/}%ComponentName%/viewer/{%ComponentName%.tsx,skinComps/*/%SkinName%.skin.tsx}',
    compose: [getReactHOTComposeFunction()],
    patterns: [{
        part: 'controller',
        path: '{,*/}%ComponentName%/viewer/%ComponentName%.controller.ts',
    }, ],
};
//# sourceMappingURL=thunderbolt.js.map