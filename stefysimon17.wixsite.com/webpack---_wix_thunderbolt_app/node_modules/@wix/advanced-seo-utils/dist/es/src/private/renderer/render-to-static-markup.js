/* eslint-disable prettier/prettier */
var _a;
import {
    render
} from './render';
import {
    TAG_TYPES
} from '../types/TagTypes';
import {
    escapeHtml
} from "../utils/escape-html";
var SELF_CLOSING_TAGS = (_a = {},
    _a[TAG_TYPES.LINK] = true,
    _a[TAG_TYPES.META] = true,
    _a);
var ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
var VALID_ATTRIBUTE_NAME_REGEX = new RegExp("^[" + ATTRIBUTE_NAME_START_CHAR + "][" + ATTRIBUTE_NAME_CHAR + "]*$");
/**
 * Renders given tag list to an array of HTML strings.
 * If tag is not supported, then it will be ommited from results.
 *
 * @example
 * [
 *  '<title>It works on my machine</title>',
 *  '<meta name="description" content="Life would be so much easier if we only had the source code"/>
 * ]
 * @see render function implemention for more details.
 * @param {Object} tags to render.
 */
export function renderToStaticMarkup(_a, _b) {
    var tags = (_a === void 0 ? {} : _a).tags;
    var _c = _b === void 0 ? {} : _b,
        _d = _c.allowDisabled,
        allowDisabled = _d === void 0 ? false : _d,
        _e = _c.logError,
        logError = _e === void 0 ? function() {} : _e;
    var sanitizedTags = sanitizeTags(tags, allowDisabled);
    return render(sanitizedTags, {
            logError: logError
        })
        .map(function(element) {
            var type = element.type,
                props = element.props;
            var htmlAttributes = Object.keys(props)
                .filter(function(prop) {
                    return !['dangerouslySetInnerHTML', 'children'].includes(prop);
                })
                .filter(function(prop) {
                    return prop.match(VALID_ATTRIBUTE_NAME_REGEX);
                })
                .map(function(prop) {
                    return prop + "=\"" + escapeHtml(props[prop]) + "\"";
                })
                .join(' ');
            var html = "<" + type;
            if (htmlAttributes) {
                html = html + " " + htmlAttributes;
            }
            if (SELF_CLOSING_TAGS[type]) {
                html = html + "/>";
            } else {
                html = html + ">" + renderChildren(props) + "</" + type + ">";
            }
            return html;
        });
}

function sanitizeTags(tags, allowDisabled) {
    if (tags === void 0) {
        tags = [];
    }
    if (!Array.isArray(tags) || allowDisabled) {
        return tags;
    }
    return tags.filter(function(tag) {
        return !tag.disabled || tag.disabled === 'false';
    });
}

function renderChildren(props) {
    if (props.dangerouslySetInnerHTML) {
        return props.dangerouslySetInnerHTML.__html;
    }
    if (props && typeof props.children === 'string') {
        return escapeHtml(props.children);
    }
    return '';
}