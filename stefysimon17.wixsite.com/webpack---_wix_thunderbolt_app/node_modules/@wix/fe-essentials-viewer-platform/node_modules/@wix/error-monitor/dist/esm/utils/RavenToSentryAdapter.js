var RavenToSentryAdapter = /** @class */ (function() {
    function RavenToSentryAdapter(ravenClient) {
        this.ravenClient = ravenClient;
    }
    RavenToSentryAdapter.prototype.captureException = function(exception, options) {
        this.ravenClient.captureException(exception, options);
        return this.ravenClient.lastEventId();
    };
    RavenToSentryAdapter.prototype.captureMessage = function(message, options) {
        this.ravenClient.captureMessage(message, options);
        return this.ravenClient.lastEventId();
    };
    RavenToSentryAdapter.prototype.addBreadcrumb = function(breadcrumb) {
        return this.ravenClient.captureBreadcrumb(breadcrumb);
    };
    return RavenToSentryAdapter;
}());
export {
    RavenToSentryAdapter
};
//# sourceMappingURL=RavenToSentryAdapter.js.map