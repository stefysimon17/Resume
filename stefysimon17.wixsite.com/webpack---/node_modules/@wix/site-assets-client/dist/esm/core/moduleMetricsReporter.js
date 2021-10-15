export var ModuleMetricsReporter = function(metricsReporter, module) {
    var formatMetricName = function(metric) {
        return metric + "-" + module.name;
    };
    return {
        meter: function(metricName) {
            return metricsReporter.meter(formatMetricName(metricName));
        },
        runAsyncAndReport: function(asyncMethod, methodName) {
            return metricsReporter.runAsyncAndReport(asyncMethod, formatMetricName(methodName));
        },
        reportError: function(err) {
            metricsReporter.meter(formatMetricName("error-" + err.name));
            return metricsReporter.reportError(err);
        },
        histogram: function(metricName, value) {
            return metricsReporter.histogram(formatMetricName(metricName), value);
        }
    };
};