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
import * as React from 'react';
import {
    TAG_TYPES
} from '../types/TagTypes';
var LINK = TAG_TYPES.LINK,
    META = TAG_TYPES.META,
    SCRIPT = TAG_TYPES.SCRIPT,
    TITLE = TAG_TYPES.TITLE;
/**
 * Renders given tag list to an array of react components.
 * If tag is not supported, then it will be ommited from results.
 *
 * @summary Renders given tag list to an array of react components.
 * @param {Array} tags to render.
 */
export function render(tags, options) {
    if (options === void 0) {
        options = {
            logError: function() {}
        };
    }
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .map(function(tag) {
            var type = (tag || {}).type;
            switch (type) {
                case TITLE:
                    return renderTitle(tag);
                case META:
                    return renderMeta(tag);
                case LINK:
                    return renderLink(tag);
                case SCRIPT:
                    return renderScript(tag, options);
                default:
                    return null;
            }
        })
        .filter(function(_) {
            return _;
        });
}

function renderTitle(_a) {
    var children = _a.children;
    return React.createElement("title", null, isValid(children) ? children : '');
}

function renderMeta(_a) {
    var props = _a.props;
    return React.createElement("meta", __assign({}, filterValidProps(props)));
}

function renderLink(_a) {
    var props = _a.props;
    return React.createElement("link", __assign({}, filterValidProps(props)));
}

function renderScript(_a, options) {
    var props = _a.props,
        children = _a.children;
    if (options === void 0) {
        options = {
            logError: function() {}
        };
    }
    var type = (props || {}).type;
    if (type === 'application/ld+json' && isValidJson(children, options)) {
        var data = JSON.stringify(JSON.parse(children));
        return (React.createElement("script", {
            type: "application/ld+json",
            dangerouslySetInnerHTML: {
                __html: replaceUnsafeCharsInJson(data)
            }
        }));
    }
    return null;
}

function filterValidProps(props) {
    return Object.keys(props || {}).reduce(function(acc, name) {
        if (isValid(props[name])) {
            acc[name] = props[name];
        }
        return acc;
    }, {});
}

function isValidJson(value, _a) {
    var _b = (_a === void 0 ? {} : _a).logError,
        logError = _b === void 0 ? function() {} : _b;
    try {
        return isValid(value) && !!JSON.parse(value);
    } catch (error) {
        logError({
            error: error,
            data: {
                value: value
            }
        });
        return false;
    }
}

function isValid(value) {
    return typeof value === 'string';
}
export function replaceUnsafeCharsInJson(json) {
    var escapedChars = {
        '<': '\\u003C',
        '>': '\\u003E',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029',
    };
    return json.replace(/[<>\u2028\u2029]/g, function(unsafeChar) {
        return escapedChars[unsafeChar];
    });
}