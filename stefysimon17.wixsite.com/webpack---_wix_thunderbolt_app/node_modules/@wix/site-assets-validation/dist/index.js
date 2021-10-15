"use strict";

var createValidator = require('./validator');

var _require = require('./consts'),
    dataFixerParamNames = _require.dataFixerParamNames,
    reservedParamNames = _require.reservedParamNames;

module.exports = {
    createValidator: createValidator,
    dataFixerParamNames: dataFixerParamNames,
    reservedParamNames: reservedParamNames
};
//# sourceMappingURL=index.js.map