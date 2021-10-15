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
var __rest = (this && this.__rest) || function(s, e) {
    var t = {};
    for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export var BUNDLE_PREFIX = 'rb_'; // means "registry bundle"
export var LOCAL_NAMESPACE_SUFFIX = '.local';
export function withProdNamespace(namespace) {
    return namespace.replace(LOCAL_NAMESPACE_SUFFIX, '');
}
export function withLocalNamespace(namespace) {
    return "" + namespace + LOCAL_NAMESPACE_SUFFIX;
}

function getComponentName(componentName, originalComponentName) {
    if (!componentName) {
        return null;
    }
    if (componentName === originalComponentName || !originalComponentName) {
        return componentName;
    } else {
        return componentName.replace(new RegExp(originalComponentName, 'g'), '~') + "~" + originalComponentName;
    }
}
export var getBundleId = function(props) {
    var componentName = props.componentName,
        originalComponentName = props.originalComponentName,
        part = props.part,
        _a = props.namespace,
        namespace = _a === void 0 ? '' : _a,
        host = props.host,
        batch = props.batch;
    var name = getComponentName(componentName, originalComponentName);
    if (componentName && part) {
        return "" + BUNDLE_PREFIX + namespace + "." + host + "[" + name + "]" + part;
    } else if (componentName) {
        return "" + BUNDLE_PREFIX + namespace + "." + host + "[" + name + "]";
    } else if (batch) {
        return "" + BUNDLE_PREFIX + namespace + "." + host + "_" + batch;
    } else if (part) {
        return "" + BUNDLE_PREFIX + namespace + "." + host + "~" + part;
    } else {
        return "" + BUNDLE_PREFIX + namespace + "." + host;
    }
};
export var getBundleName = function(props) {
    var _a = props.extension,
        extension = _a === void 0 ? 'js' : _a,
        rest = __rest(props, ["extension"]);
    return getBundleId(rest) + "." + extension;
};
export var getBundleExtension = function(bundleName) {
    var parsed = bundleName.match(/\.([a-z]+)$/);
    if (!parsed) {
        return null;
    }
    return parsed[1];
};
export var getModuleIdFromBundle = function(bundleName) {
    var extension = getBundleExtension(bundleName);
    return {
        bundleId: extension ?
            bundleName
            .replace(/\.[a-f0-9]{8}/, '')
            .replace(".chunk", '')
            .replace(".bundle", '')
            .replace(".min", '')
            .replace("." + extension, '') :
            null,
        extension: extension,
    };
};
export var parseBundleId = function(bundleId) {
    /**
     * rb_namespace.host
     * rb_namespace.host[componentName]
     * rb_namespace.host[componentName]part
     *
     * Original RegExp with the named groups:
     *
     * /(?<namespace>[^[]+)\.(?<host>[^[]+)(\[(?<componentName>.+)\])?(?<part>[^.]+)?/
     *
     * Some browser still does not support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
     * see `lookbehind assertions` section
     */
    // _____________ns[1]____host[2]___batch[3]____eagerPart[4]___name[5]___part[6]_
    var result = /([^[]+)\.([^[_~]+)(?:_([^[]+)|(?:~([^[]+))?)?(?:\[(.+)\])?([^.]+)?/.exec(bundleId);
    if (!result) {
        return null;
    }
    var prefixAndNamespace = result[1],
        host = result[2],
        batch = result[3],
        eagerPart = result[4],
        name = result[5],
        part = result[6];
    var namespace = prefixAndNamespace.replace(BUNDLE_PREFIX, '');
    if (batch && (name || part)) {
        return null;
    }
    var _a = name ? name.split('~') : [],
        componentName = _a[0],
        rest = _a.slice(1);
    var originalComponentName = rest.pop();
    return {
        namespace: namespace ? namespace : undefined,
        host: host,
        componentName: name ?
            componentName + rest.map(function(s) {
                return originalComponentName + s;
            }).join('') :
            undefined,
        originalComponentName: originalComponentName,
        part: part ? part : eagerPart,
        batch: batch,
    };
};
export var parseBundleName = function(bundleName) {
    if (!bundleName.startsWith(BUNDLE_PREFIX)) {
        return null;
    }
    var _a = getModuleIdFromBundle(bundleName),
        bundleId = _a.bundleId,
        extension = _a.extension;
    if (bundleId === null || extension === null) {
        return null;
    }
    var parsed = parseBundleId(bundleId);
    return parsed === null ?
        null :
        __assign(__assign({}, parsed), {
            extension: extension,
            id: bundleId
        });
};
export var getManifestName = function(_a) {
    var namespace = _a.namespace,
        host = _a.host,
        isDev = _a.isDev;
    var extension = (isDev ? '' : '.min') + ".json";
    return "" + BUNDLE_PREFIX + namespace + "." + host + ".manifest" + extension;
};
export var parseManifestName = function(manifest) {
    if (!manifest.startsWith(BUNDLE_PREFIX)) {
        return null;
    }
    var result = /(.+)\.manifest(\.min)?\.json$/.exec(manifest.replace(BUNDLE_PREFIX, ''));
    if (!result) {
        return null;
    }
    var namespaceAndHost = result[1];
    var symbols = namespaceAndHost.split('.');
    var host = symbols.pop();
    var namespace = symbols.join('.');
    return {
        host: host,
        namespace: namespace,
    };
};
export function getLazyFactoryID(id) {
    return id + "_lazy_factory";
}
//# sourceMappingURL=bundles.js.map