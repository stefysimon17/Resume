var componentDocumentManagementPath = '{,*/}%ComponentName%/documentManagement';
export var documentManagementBundlesConfig = {
    parts: false,
    components: false,
    host: true,
};
export var documentManagementConventions = {
    patterns: [{
            part: 'hooks',
            path: componentDocumentManagementPath + "/%ComponentName%.hooks.ts",
        },
        {
            part: 'dataSchema',
            path: componentDocumentManagementPath + "/%ComponentName%.dataSchema.ts",
        },
        {
            part: 'metaData',
            path: componentDocumentManagementPath + "/%ComponentName%.metadata.ts",
        },
        {
            part: 'propertiesSchema',
            path: componentDocumentManagementPath + "/%ComponentName%.propsSchema.ts",
        },
        {
            part: 'componentDefinition',
            path: componentDocumentManagementPath + "/%ComponentName%.definition.ts",
        },
    ],
};
//# sourceMappingURL=documentManagement.js.map