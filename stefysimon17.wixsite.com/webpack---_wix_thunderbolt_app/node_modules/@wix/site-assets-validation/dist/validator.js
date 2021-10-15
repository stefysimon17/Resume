"use strict";

function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
}

var _require = require('./consts'),
    defaultReservedParamNames = _require.reservedParamNames,
    dataFixerParamNames = _require.dataFixerParamNames,
    mandatoryPageModuleRequestParams = _require.mandatoryPageModuleRequestParams,
    mandatorySiteModuleRequestParams = _require.mandatorySiteModuleRequestParams;

var _require2 = require('./errors'),
    ReservedParameterError = _require2.ReservedParameterError;

var _require3 = require('./kendash'),
    notEmpty = _require3.notEmpty;

var paramNames = function paramNames(arr) {
    return arr ? Object.keys(arr) : [];
};

var makeMandatoryParamsValidator = require('./mandatoryParamsValidator');

var pageMandatoryParamsValidator = makeMandatoryParamsValidator(mandatoryPageModuleRequestParams);
var siteMandatoryParamsValidator = makeMandatoryParamsValidator(mandatorySiteModuleRequestParams); // todo refactor: validationCheckMessage should get the params and build the whole message (extract message building to a collaborator)

module.exports = function() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$additionalReserv = _ref.additionalReservedParams,
        additionalReservedParams = _ref$additionalReserv === void 0 ? [] : _ref$additionalReserv;

    /**
     * validate that custom module params must not contain reserved param names
     */
    var customParamsValidation = {
        predicate: function predicate(param) {
            return [].concat(_toConsumableArray(additionalReservedParams), _toConsumableArray(defaultReservedParamNames)).includes(param);
        },
        validationCheckMessage: 'reserved param'
    };
    /**
     * validate that data fixer params must only contain allowed data fixer param names
     */

    var dataFixerParamsValidation = {
        predicate: function predicate(param) {
            return !dataFixerParamNames.includes(param);
        },
        validationCheckMessage: 'not data fixer param'
    };

    var validateReservedParams = function validateReservedParams(params, validation) {
        var invalidParams = paramNames(params).filter(validation.predicate);

        if (notEmpty(invalidParams)) {
            throw new ReservedParameterError(validation.validationCheckMessage, invalidParams);
        }
    };

    return {
        validateCustomParams: function validateCustomParams(params) {
            return validateReservedParams(params, customParamsValidation);
        },
        validateDataFixerParams: function validateDataFixerParams(params) {
            return validateReservedParams(params, dataFixerParamsValidation);
        },
        validateMandatoryPageModuleParams: function validateMandatoryPageModuleParams(params) {
            return pageMandatoryParamsValidator.validate(params);
        },
        validateMandatorySiteModuleParams: function validateMandatorySiteModuleParams(params) {
            return siteMandatoryParamsValidator.validate(params);
        }
    };
};
//# sourceMappingURL=validator.js.map