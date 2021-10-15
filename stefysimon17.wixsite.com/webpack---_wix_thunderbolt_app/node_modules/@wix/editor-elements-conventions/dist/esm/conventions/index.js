import {
    editorConventions,
    editorBundlesConfig
} from './editor';
import {
    editorXBundlesConfig,
    editorXConventions
} from './editorX';
import {
    dataBindingBundlesConfig,
    dataBindingConventions,
} from './dataBinding';
import {
    documentManagementBundlesConfig,
    documentManagementConventions,
} from './documentManagement';
import {
    corvidBundlesConfig,
    corvidConventions
} from './corvid';
import {
    thunderboltPreviewBundlesConfig,
    thunderboltPreviewConventions,
} from './thunderboltPreview';
import {
    siteAssetsBundlesConfig,
    siteAssetsConventions
} from './siteAssets';
import {
    thunderboltConventions,
    thunderboltBundlesConfig,
} from './thunderbolt';
export var hostsConventions = {
    corvid: corvidConventions,
    editor: editorConventions,
    editorX: editorXConventions,
    documentManagement: documentManagementConventions,
    thunderboltPreview: thunderboltPreviewConventions,
    siteAssets: siteAssetsConventions,
    dataBinding: dataBindingConventions,
    thunderbolt: thunderboltConventions,
};
export var hostsBundlesConfigs = {
    corvid: corvidBundlesConfig,
    editor: editorBundlesConfig,
    editorX: editorXBundlesConfig,
    documentManagement: documentManagementBundlesConfig,
    thunderboltPreview: thunderboltPreviewBundlesConfig,
    siteAssets: siteAssetsBundlesConfig,
    dataBinding: dataBindingBundlesConfig,
    thunderbolt: thunderboltBundlesConfig,
};
var stylableMetadataAsset = {
    pattern: /\.metadata\.json$/,
    type: 'stylable-metadata',
};
export var hostsPatterns = {
    editor: conventionToPatterns(corvidConventions),
    thunderbolt: conventionToPatterns(thunderboltConventions),
    corvid: conventionToPatterns(corvidConventions),
    documentManagement: conventionToPatterns(documentManagementConventions),
    dataBinding: conventionToPatterns(dataBindingConventions),
};
export var hostAssets = {
    thunderbolt: [stylableMetadataAsset],
    thunderboltPreview: [stylableMetadataAsset],
};
export function replacePatternPlaceholders(pattern, placeholders) {
    if (placeholders === void 0) {
        placeholders = {};
    }
    return pattern.replace(/%([^%]+)%/g, function(_, id) {
        return placeholders[id] ? placeholders[id] : '*';
    });
}

function conventionToPatterns(convention) {
    var _a;
    var patterns = [];
    if (convention.path) {
        patterns.push(convention.path);
    }
    (_a = convention.patterns) === null || _a === void 0 ? void 0 : _a.forEach(function(_a) {
        var path = _a.path;
        patterns.push(path);
    });
    return patterns;
}
//# sourceMappingURL=index.js.map