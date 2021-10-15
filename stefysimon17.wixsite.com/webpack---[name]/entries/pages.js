//@ts-check
import interaction from '../utils/interaction.js';
import tti_tbt from './tti-tbt.js';
import {
    addEventListener
} from '../utils/windowEvents.js';
import config from '../utils/config.js';
import {
    excludeSearch
} from '../utils/utils.js';
import {
    fixURL
} from '../utils/consent.js';
import sequence from '../utils/sequence.js';

const subEntryType = 'page-transition';
const entryType = `${subEntryType}s`;

let pn = 0;

/**
 * Get page transition duration
 * @param {import('../utils/utils.js').State} state
 */
export default function pages(state) {
    const window = state[0];
    let origin = getCurrentURL();
    const {
        clientType,
        pageEvent
    } = config;

    const {
        report,
        result
    } = sequence(window, entryType, pageEvent);

    addEventListener(window, 'popstate', ({
        type,
        timeStamp
    }) => _report(type, timeStamp, 0), false);
    interaction(state, _report);

    return result;

    function _report(action, startTime, delay) {
        tti_tbt(state, Promise.resolve(startTime + delay)).then(finish => {
            const destination = getCurrentURL();
            if (urlChanged(origin, destination)) {

                const duration = finish.tti - startTime;
                const value = {
                    entryType: subEntryType,
                    clientType,
                    origin,
                    destination,
                    action,
                    startTime,
                    delay,
                    duration,
                    pn: ++pn,
                    ...finish
                };
                origin = destination;
                report(value);
            }
        });
    }

    function getCurrentURL() {
        return fixURL(window.location.href, window);
    }

    function urlChanged(origin, destination) {
        return excludeSearch(origin) !== excludeSearch(destination);
    }
}

export function getPn() {
    return pn;
}