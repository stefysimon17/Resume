var __spreadArrays = (this && this.__spreadArrays) || function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
export var resolveStructuredData = function(tags) {
    if (tags === void 0) {
        tags = [];
    }
    var schemas = {};
    return tags.reduce(function(resolvedTags, tag) {
        var _a, _b;
        var _c = tag.meta || {},
            schemaType = _c.schemaType,
            selectedVariant = _c.selectedVariant;
        if (schemaType) {
            var existingSchema = schemas[schemaType];
            if (existingSchema) {
                var variant = (_b = (_a = existingSchema.meta) === null || _a === void 0 ? void 0 : _a.variants) === null || _b === void 0 ? void 0 : _b.find(function(currentVariant) {
                    return currentVariant.schemaType === selectedVariant;
                });
                if (variant) {
                    existingSchema.children = variant.schema;
                    existingSchema.meta.selectedVariant = selectedVariant;
                    existingSchema.disabled = tag.disabled || variant.disabled;
                } else {
                    existingSchema.disabled = tag.disabled;
                }
                return resolvedTags;
            } else {
                schemas[tag.meta.schemaType] = tag;
            }
        }
        return __spreadArrays(resolvedTags, [tag]);
    }, []);
};