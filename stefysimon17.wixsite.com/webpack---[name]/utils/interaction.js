//@ts-check
import {
    max,
    handleFinish
} from './utils.js';
import {
    addEventListener,
    removeEventListener
} from './windowEvents.js';
import config from './config.js';

const EVENT_TYPES = [
    'pointerdown',
    'click',
    'mousedown',
    'keydown',
    'touchstart'
];

/**
 * @callback interactionCallback
 * @param {string} action 
 * @param {number} startTime 
 * @param {number} delay 
 * @returns {void}
 */

/**
 * @type {interactionCallback[]}
 */
const cbs = [];

//@ts-check
let prev = 0;

/**
 * Register for user interactions
 * @param {import('./utils.js').State} state
 * @param {interactionCallback} cb 
 */
export default function interaction([window, performance], cb) {
    if (cbs.push(cb) === 1) {
        EVENT_TYPES.forEach(eventType => addEventListener(window, eventType, onInput, false));
    }
    return handleFinish(cbs, cb, () => EVENT_TYPES.forEach(eventType => removeEventListener(window, eventType, onInput, false)));

    /**
     * @param {Event} event
     */
    function onInput({
        type,
        timeStamp,
        cancelable
    }) {
        if (!cancelable) {
            return;
        }

        const now = performance.now();
        const end = timeStamp > 1e12 ? Date.now() : now;
        const delay = max(end - timeStamp, 0);
        const startTime = now - delay;

        if (type === EVENT_TYPES[0]) {
            onPointerDown(type, startTime, delay);
        } else {
            notify(type, startTime, delay);
        }
    }

    /**
     * @param {string} action 
     * @param {number} startTime 
     * @param {number} delay 
     */
    function onPointerDown(action, startTime, delay) {
        addEventListener(window, 'pointerup', onPointerUp, false);
        addEventListener(window, 'pointercancel', removePointerEventListeners, false);

        function onPointerUp() {
            notify(action, startTime, delay);
            removePointerEventListeners();
        }

        function removePointerEventListeners() {
            removeEventListener(window, 'pointerup', onPointerUp, false);
            removeEventListener(window, 'pointercancel', removePointerEventListeners, false);
        }
    }

    /**
     * @param {string} action 
     * @param {number} startTime 
     * @param {number} delay 
     */
    function notify(action, startTime, delay) {
        const now = startTime + delay;
        if (now - prev < config.eventDelta) {
            return;
        }
        prev = now;

        cbs.forEach(cb => cb(action, startTime, delay));
    }
}