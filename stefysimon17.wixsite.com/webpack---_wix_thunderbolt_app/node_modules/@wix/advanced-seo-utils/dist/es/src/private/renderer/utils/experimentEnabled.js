import {
    siteIDs
} from '../../adapters/utils';
export function experimentEnabled(key, context) {
    var experiments = (context === null || context === void 0 ? void 0 : context[siteIDs.EXPERIMENTS]) || {};
    return ['true', 'new', true].includes(experiments[key]);
}