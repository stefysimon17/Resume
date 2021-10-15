var __extends = (this && this.__extends) || (function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({
                    __proto__: []
                }
                instanceof Array && function(d, b) {
                    d.__proto__ = b;
                }) ||
            function(d, b) {
                for (var p in b)
                    if (b.hasOwnProperty(p)) d[p] = b[p];
            };
        return extendStatics(d, b);
    };
    return function(d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var getErrorMessage = function(e) {
    return e.stack || e.message;
};
var appendToStack = function(stack, moreInfo) {
    return stack + "\n\n" + moreInfo;
};
var SiteAssetsClientError = /** @class */ (function(_super) {
    __extends(SiteAssetsClientError, _super);

    function SiteAssetsClientError(message, errorOptions) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        _this.name = _this.constructor.name;
        if (errorOptions && errorOptions.cause) {
            _this.cause = errorOptions.cause;
            _this.stack = appendToStack(_this.stack, "Caused By: " + getErrorMessage(_this.cause));
        }
        return _this;
    }
    return SiteAssetsClientError;
}(Error));
export {
    SiteAssetsClientError
};
var HttpClientFetchError = /** @class */ (function(_super) {
    __extends(HttpClientFetchError, _super);

    function HttpClientFetchError(message, cause) {
        return _super.call(this, message, {
            cause: cause
        }) || this;
    }
    return HttpClientFetchError;
}(SiteAssetsClientError));
export {
    HttpClientFetchError
};
var UnexpectedHttpClientError = /** @class */ (function(_super) {
    __extends(UnexpectedHttpClientError, _super);

    function UnexpectedHttpClientError(cause) {
        return _super.call(this, 'http client unexpectedly threw an error', {
            cause: cause
        }) || this;
    }
    return UnexpectedHttpClientError;
}(SiteAssetsClientError));
export {
    UnexpectedHttpClientError
};
var InvalidServerResponse = /** @class */ (function(_super) {
    __extends(InvalidServerResponse, _super);

    function InvalidServerResponse(message) {
        return _super.call(this, message) || this;
    }
    return InvalidServerResponse;
}(SiteAssetsClientError));
export {
    InvalidServerResponse
};
var UrlBuilderError = /** @class */ (function(_super) {
    __extends(UrlBuilderError, _super);

    function UrlBuilderError(cause) {
        return _super.call(this, 'SITE-ASSETS URL BUILDER FAILED', {
            cause: cause
        }) || this;
    }
    return UrlBuilderError;
}(SiteAssetsClientError));
export {
    UrlBuilderError
};
var SiteAssetsServerError = /** @class */ (function(_super) {
    __extends(SiteAssetsServerError, _super);

    function SiteAssetsServerError(siteAssetsUrl, cause) {
        var _this = _super.call(this, cause.message, {
            cause: cause
        }) || this;
        _this.stack = appendToStack(_this.stack, "URL: " + siteAssetsUrl);
        return _this;
    }
    return SiteAssetsServerError;
}(SiteAssetsClientError));
export {
    SiteAssetsServerError
};
var SiteAssetsFallbackError = /** @class */ (function(_super) {
    __extends(SiteAssetsFallbackError, _super);

    function SiteAssetsFallbackError(cause, siteAssetsServerError) {
        var _this = _super.call(this, cause.message, {
            cause: cause
        }) || this;
        if (siteAssetsServerError) {
            _this.stack = appendToStack(_this.stack, "" + siteAssetsServerError.stack);
        }
        return _this;
    }
    return SiteAssetsFallbackError;
}(SiteAssetsClientError));
export {
    SiteAssetsFallbackError
};
var SiteAssetsClientValidationError = /** @class */ (function(_super) {
    __extends(SiteAssetsClientValidationError, _super);

    function SiteAssetsClientValidationError(message) {
        return _super.call(this, message) || this;
    }
    return SiteAssetsClientValidationError;
}(SiteAssetsClientError));
export {
    SiteAssetsClientValidationError
};
var SiteAssetsLoadModuleExecutorError = /** @class */ (function(_super) {
    __extends(SiteAssetsLoadModuleExecutorError, _super);

    function SiteAssetsLoadModuleExecutorError(cause) {
        return _super.call(this, 'SITE-ASSETS FAILED TO LOAD MODULE EXECUTOR', {
            cause: cause
        }) || this;
    }
    return SiteAssetsLoadModuleExecutorError;
}(SiteAssetsClientError));
export {
    SiteAssetsLoadModuleExecutorError
};
var SiteAssetsClientSpecMapSupplierError = /** @class */ (function(_super) {
    __extends(SiteAssetsClientSpecMapSupplierError, _super);

    function SiteAssetsClientSpecMapSupplierError() {
        return _super.call(this, 'Must send clientSpecMap or clientSpecMapSupplier') || this;
    }
    return SiteAssetsClientSpecMapSupplierError;
}(SiteAssetsClientError));
export {
    SiteAssetsClientSpecMapSupplierError
};