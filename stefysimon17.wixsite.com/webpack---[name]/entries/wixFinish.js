//@ts-check
import config from '../utils/config.js';
import {
    addField,
    allFulfilled,
    noop
} from '../utils/utils.js';
import {
    dcl,
    addEventListener
} from '../utils/windowEvents.js';
import getWixBiSession from '../utils/wixBiSession.js';
import * as storage from '../utils/storage.js';

const entryType = 'wix-finish';

const FIELDS = [
    'microPop',
    'is_rollout',
    'is_platform_loaded',
    'maybeBot',
    'isjp'
];
const MAP_NAME = {
    is_rollout: 'isRollout',
    is_platform_loaded: 'isPlatformLoaded',
    isjp: 'maybeBot'
};
const TIMESTAMP = 'timestamp';

/**
 * Final Wix session attributes
 * @param {import('../utils/utils.js').State} state
 * @param {Promise} interactive
 */
export default function wixFinish(state, interactive) {
    const window = /** @type {Object} */ (state[0]);
    const model = window.fetchDynamicModel || Promise.resolve({});
    return allFulfilled([getCDN(window), model, interactive, dcl(window)]).then(([cdn, {
        visitorId
    }]) => {
        const wixBiSession = getWixBiSession(window);
        if (!wixBiSession) {
            throw entryType;
        }

        const isSsr = !window.clientSideRender;
        const {
            btype
        } = wixBiSession;
        const commonConfig = window.commonConfig || window.viewerModel ? .siteFeaturesConfigs.commonConfig;
        const {
            bsi
        } = commonConfig;
        const result = {
            entryType,
            isSsr,
            isWelcome: !!window.requestCloseWelcomeScreen,
            ...cdn && {
                cdn
            },
            ...visitorId && {
                visitorId
            },
            ...btype && {
                btype
            },
            ...bsi && {
                bsi
            }
        };

        addField(result, 'pageId', window.rendererModel ? .landingPageId || window.firstPageId);
        if (isSsr) {
            const {
                ssrInfo = {}
            } = window;
            addField(result, 'ssrDuration', ssrInfo.renderBodyTime || ssrInfo.timeSpentInSSR);
            addField(result, 'ssrTimestamp', ssrInfo.renderTimeStamp);
        }

        FIELDS.forEach(field => addField(result, MAP_NAME[field] || field, wixBiSession[field]));

        addSessionDelta(result);

        return result;
    });

    function addSessionDelta(result) {
        if (!config.sessionDelta) {
            storage.remove(window, TIMESTAMP);
            return;
        }

        const prevSession = storage.get(window, TIMESTAMP);
        const currSession = updateTimestamp();
        const sessionDelta = currSession - prevSession;
        if (sessionDelta > 0 && sessionDelta < currSession) {
            result.sessionDelta = sessionDelta;
        }
        addEventListener(window.document, 'consentPolicyChanged', updateTimestamp, false);
    }

    function updateTimestamp() {
        const timestamp = Date.now();
        storage.set(window, TIMESTAMP, timestamp);
        return timestamp;
    }
}

function getCDN({
    URL
}) {
    if (!URL || config.suppressBi) {
        return Promise.resolve();
    }
    const {
        origin
    } = new URL(config.src);
    return fetch(`${origin}/cdn_detect`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        }).then(response => response.headers.get('CDN-seen'))
        .catch(noop);
}