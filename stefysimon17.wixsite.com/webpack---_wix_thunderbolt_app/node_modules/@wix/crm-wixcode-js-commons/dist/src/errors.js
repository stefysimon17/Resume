"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.formatPlatformizedHttpError = function(rawXhrError) {
    var status = rawXhrError.status,
        responseText = rawXhrError.responseText;
    if (!status && !responseText) {
        return rawXhrError;
    }
    if (status === 400) {
        return "Bad Request: please check the user inputs.";
    }
    if (status === 404) {
        return "Not Found: the requested item no longer exists.";
    }
    var errorMessage;
    try {
        errorMessage = JSON.parse(responseText).message;
    } catch (e) {
        /*do nothing */
    }
    return (errorMessage || 'unknown failure') + " (" + (status || 0) + ")";
};
//# sourceMappingURL=errors.js.map