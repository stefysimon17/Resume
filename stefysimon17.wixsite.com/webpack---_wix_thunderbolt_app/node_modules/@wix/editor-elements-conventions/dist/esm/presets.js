import {
    findByPartName,
    ThunderboltPreviewParts
} from './helpers';
export function getReactHOTComposeFunction(_a) {
    var _b = _a === void 0 ? {} : _a,
        internalPart = _b.internalPart;
    return {
        isDev: true,
        transform: function(_a) {
            var value = _a.value,
                componentName = _a.componentName;
            if (process.env.IGNORE_HMR) {
                return {
                    imports: [],
                    value: value,
                };
            }
            return {
                imports: [{
                    moduleName: '@wix/component-hot-loader',
                    specifiers: [{
                        type: 'named',
                        value: 'hot',
                    }, ],
                }, ],
                value: internalPart ?
                    "{..." + value + ", ['" + internalPart + "']: hot(module, " + value + "['" + internalPart + "'], '" + componentName + "')}" :
                    "hot(module, " + value + ", '" + componentName + "')",
            };
        },
    };
}
export function getPreviewWrapperComposeFunction() {
    return {
        transform: function(_a) {
            var value = _a.value,
                entries = _a.entries;
            var previewWrapperEntry = findByPartName(entries, ThunderboltPreviewParts.PreviewWrapper);
            if (previewWrapperEntry) {
                var moduleName = previewWrapperEntry.moduleName;
                return {
                    value: moduleName + "(" + value + ")",
                };
            }
            var previewMapperEntry = findByPartName(entries, ThunderboltPreviewParts.PreviewMapper);
            if (previewMapperEntry) {
                return {
                    imports: [{
                        moduleName: '@wix/editor-elements-preview-utils',
                        specifiers: [{
                            type: 'named',
                            value: 'createPreviewFallback',
                        }, ],
                    }, ],
                    value: "createPreviewFallback(" + value + ")",
                };
            }
            return {
                value: value,
            };
        },
    };
}
export function getVisibilityMapperComposeFunction() {
    return {
        transform: function(_a) {
            var value = _a.value;
            return {
                imports: [{
                    moduleName: '@wix/editor-elements-preview-utils',
                    specifiers: [{
                        type: 'named',
                        value: 'withPreviewVisibilityProps',
                    }, ],
                }, ],
                value: "withPreviewVisibilityProps(" + value + ")",
            };
        },
    };
}
//# sourceMappingURL=presets.js.map