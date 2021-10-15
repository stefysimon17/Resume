//@ts-check
import {
    noop
} from './utils.js';

/**
 * @callback ObserverCallback
 * @param {PerformanceEntryList} list
 * @param {PerformanceObserver} observer
 */

/**
 * Wrapper for PerformanceObserver
 * @param {any} PerformanceObserver 
 * @param {string} type 
 * @param {ObserverCallback} [cb = noop] 
 * @param {boolean} [buffered = true]
 * @returns {PerformanceObserver|undefined}
 */
export default function observe(PerformanceObserver, type, cb = noop, buffered = true) {
    if (!PerformanceObserver) {
        return;
    }

    const {
        supportedEntryTypes
    } = PerformanceObserver;
    if (!supportedEntryTypes || !supportedEntryTypes.includes(type)) {
        return;
    }

    const observer = new PerformanceObserver((list, observer) => cb(list.getEntries(), observer));
    try {
        observer.observe({
            type,
            buffered
        });
    } catch (e) {
        observer.observe({
            entryTypes: [type]
        });
    }
    return observer;
}