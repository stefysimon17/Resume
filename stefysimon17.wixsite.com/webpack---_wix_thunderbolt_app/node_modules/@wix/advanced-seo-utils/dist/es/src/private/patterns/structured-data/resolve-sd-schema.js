export function resolveSdSchema(structuredDataString) {
    if (structuredDataString === void 0) {
        structuredDataString = '{}';
    }
    try {
        var resolvedSdString = fixNestedObjectFields(structuredDataString);
        resolvedSdString = removeScriptTag(resolvedSdString);
        resolvedSdString = fixNestedArrayFields(resolvedSdString);
        resolvedSdString = removeEscape(resolvedSdString);
        var dataObject = JSON.parse(resolvedSdString);
        return clearEmptyFields({
            dataObject: dataObject
        });
    } catch (error) {
        return '{}';
    }
}

function removeScriptTag(structuredDataString) {
    var sdWithoutSpaces = structuredDataString.replace(/\s/g, '');
    if (sdWithoutSpaces.startsWith('<script')) {
        var contentStartIndex = structuredDataString.indexOf('>');
        var contentEndIndex = structuredDataString.lastIndexOf('<');
        structuredDataString = structuredDataString.substring(contentStartIndex + 1, contentEndIndex);
    }
    return structuredDataString;
}

function removeEscape(structuredDataString) {
    structuredDataString = structuredDataString
        .replace(/(\\r\\n|\\n|\\r\\ \\)/g, '')
        .replace(/\\"/g, '"');
    var matches = structuredDataString.match(/"(.*?)"/g);
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        structuredDataString = structuredDataString.replace(match, "\"" + match
            .split('')
            .slice(1, -1)
            .join('')
            .replace(/(\\|")/g, function(value) {
                return '\\' + value;
            }) + "\"");
    }
    return structuredDataString;
}

function fixNestedObjectFields(structuredDataString) {
    var nestedObjectWithQuotes = /"{"(.*?)}"/g;
    return structuredDataString.replace(nestedObjectWithQuotes, function(match) {
        return match.slice(1, -1);
    });
}

function fixNestedArrayFields(structuredDataString) {
    var nestedArrayWithQuotes = /"\[{"(.*?)]"/g;
    return structuredDataString.replace(nestedArrayWithQuotes, function(match) {
        return match.slice(1, -1);
    });
}

function clearEmptyFields(_a) {
    var _b = _a === void 0 ? {} : _a,
        _c = _b.dataObject,
        dataObject = _c === void 0 ? {} : _c,
        containerObject = _b.containerObject,
        containerKey = _b.containerKey;
    if (!dataObject) {
        return '{}';
    }
    Object.entries(dataObject).forEach(function(_a) {
        var key = _a[0],
            val = _a[1];
        if (val && typeof val === 'object') {
            clearEmptyFields({
                dataObject: val,
                containerObject: dataObject,
                containerKey: key,
            });
        } else {
            if (!val) {
                if (isKeyRequired(key, containerObject && containerObject[containerKey])) {
                    delete containerObject[containerKey];
                } else {
                    delete dataObject[key];
                }
            }
        }
    });
    return JSON.stringify(dataObject);
}

function isKeyRequired(key, container) {
    var requiredKeys = ['url', 'contentUrl'];
    if (key === 'name') {
        var siblingKeys_1 = Object.keys(container || {});
        return requiredKeys.every(function(x) {
            return !siblingKeys_1.includes(x);
        });
    }
    return requiredKeys.includes(key);
}