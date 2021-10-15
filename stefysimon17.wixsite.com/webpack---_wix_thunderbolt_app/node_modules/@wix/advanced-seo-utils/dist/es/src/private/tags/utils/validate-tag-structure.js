export function validateTagStructure(tag, tagSchema) {
    if (tag.type !== tagSchema.type) {
        return false;
    }
    if (!tagSchema.props) {
        return true;
    }
    if (!tag.props) {
        return false;
    }
    var requiredProps = Object.keys(tagSchema.props);
    return requiredProps.every(function(propName) {
        var _a;
        if (tagSchema.props[propName]) {
            return ((_a = tag.props[propName]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === tagSchema.props[propName];
        }
        return typeof tag.props[propName] === 'string';
    });
}