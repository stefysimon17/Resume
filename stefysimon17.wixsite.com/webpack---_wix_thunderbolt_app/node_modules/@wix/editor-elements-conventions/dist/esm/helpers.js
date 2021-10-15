export var ThunderboltPreviewParts;
(function(ThunderboltPreviewParts) {
    ThunderboltPreviewParts["Mapper"] = "mapper";
    ThunderboltPreviewParts["Component"] = "component";
    ThunderboltPreviewParts["Controller"] = "controller";
    ThunderboltPreviewParts["PreviewMapper"] = "previewMapper";
    ThunderboltPreviewParts["PreviewWrapper"] = "previewWrapper";
})(ThunderboltPreviewParts || (ThunderboltPreviewParts = {}));
export var findByPartName = function(entries, part) {
    return entries.find(function(entry) {
        return entry.part === part;
    });
};
//# sourceMappingURL=helpers.js.map