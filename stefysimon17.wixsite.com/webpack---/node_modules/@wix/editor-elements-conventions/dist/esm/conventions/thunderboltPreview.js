// import { getMapperFallbackFunction } from '../fallbacks';
import {
    getReactHOTComposeFunction,
    getPreviewWrapperComposeFunction,
    // getVisibilityMapperComposeFunction,
} from '../presets';
export var thunderboltPreviewBundlesConfig = {
    parts: false,
    components: false,
    host: true,
};
export var thunderboltPreviewConventions = {
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
    compose: [getPreviewWrapperComposeFunction(), getReactHOTComposeFunction()],
    patterns: [{
            part: 'previewWrapper',
            path: '{,*/}%ComponentName%/viewer/%ComponentName%.previewWrapper.tsx',
        },
        {
            part: 'previewMapper',
            path: '{,*/}%ComponentName%/viewer/%ComponentName%.previewMapper.ts',
            // compose: [getVisibilityMapperComposeFunction()],
            // fallback: getMapperFallbackFunction(),
        },
        {
            part: 'mapper',
            path: '{,*/}%ComponentName%/viewer/%ComponentName%.mapper.ts',
        },
        {
            part: 'controller',
            path: '{,*/}%ComponentName%/viewer/%ComponentName%.controller.ts',
        },
    ],
};
//# sourceMappingURL=thunderboltPreview.js.map