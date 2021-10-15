export function createRavenToSentryTransportTestkitAdapter(sentryTransport) {
    return function(options) {
        var sendEvent = new sentryTransport({}).sendEvent;
        void sendEvent(options.data);
        if (options.onSuccess) {
            options.onSuccess();
        }
    };
}
//# sourceMappingURL=createRavenToSentryTransportTestkitAdapter.js.map