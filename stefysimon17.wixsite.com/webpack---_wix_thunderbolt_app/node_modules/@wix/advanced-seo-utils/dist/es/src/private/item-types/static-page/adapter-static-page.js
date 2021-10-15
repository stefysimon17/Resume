import {
    CONTEXT_PROPS
} from '../../types/ContextProps';
import {
    get,
    getRawValue
} from '../../utils/get';
import {
    sanitizeUrl
} from '../../utils/sanitize-url';
import {
    getKeys
} from '../../adapters/utils';
import {
    updateValueByIdentifier
} from '../../tags/values/update-by-identifier';
import {
    IDENTIFIERS
} from '../../types/Identifiers';
import {
    SD_STATUS
} from '../../consts';
var IDs = {
    PAGE_NAME: 'page.name',
    PAGE_URL: 'page.url',
    SITE_NAME: 'site.name',
    HOME_PAGE_TITLE: 'site.homePageTitle',
    INDEX_SITE: 'site.index',
    INDEX_PAGE: 'page.index',
    IS_HOME_PAGE: 'page.isHomePage',
    TITLE: 'page.title',
    DESCRIPTION: 'page.description',
    IMAGE: 'page.image',
    IMAGE_WIDTH: 'page.imageWidth',
    IMAGE_HEIGHT: 'page.imageHeight',
    FB_ADMINS: 'site.facebookAdminId',
    NEXT: 'site.nextLink',
    PREV: 'site.prevLink',
};
var userVisible = [
    IDs.PAGE_NAME,
    IDs.PAGE_URL,
    IDs.SITE_NAME,
    IDs.TITLE,
    IDs.DESCRIPTION,
];
export default {
    IDs: IDs,
    getData: function(item, options) {
        var _a;
        if (options === void 0) {
            options = {};
        }
        return (_a = {},
            _a[IDs.PAGE_NAME] = get(item, "context." + CONTEXT_PROPS.PAGE_NAME),
            _a[IDs.PAGE_URL] = sanitizeUrl(get(item, "context." + CONTEXT_PROPS.DEFAULT_URL)),
            _a[IDs.SITE_NAME] = get(item, "context." + CONTEXT_PROPS.SITE_NAME),
            _a[IDs.HOME_PAGE_TITLE] = get(item, "context." + CONTEXT_PROPS.HOME_PAGE_TITLE),
            _a[IDs.INDEX_SITE] = getRawValue(item, "context." + CONTEXT_PROPS.INDEX_SITE),
            _a[IDs.INDEX_PAGE] = getRawValue(item, "context." + CONTEXT_PROPS.INDEX_PAGE),
            _a[IDs.IS_HOME_PAGE] = getRawValue(item, "context." + CONTEXT_PROPS.IS_HOME_PAGE),
            _a[IDs.TITLE] = getTitle(item, options),
            _a[IDs.DESCRIPTION] = options.ignoreLegacy ?
            '' :
            get(item, "context." + CONTEXT_PROPS.DESCRIPTION),
            _a[IDs.IMAGE] = getImage(item, options),
            _a[IDs.IMAGE_WIDTH] = get(item, "context." + CONTEXT_PROPS.OG_IMAGE_WIDTH),
            _a[IDs.IMAGE_HEIGHT] = get(item, "context." + CONTEXT_PROPS.OG_IMAGE_HEIGHT),
            _a[IDs.FB_ADMINS] = get(item, "context." + CONTEXT_PROPS.FB_ADMINS),
            _a[IDs.NEXT] = get(item, "context." + CONTEXT_PROPS.NEXT),
            _a[IDs.PREV] = get(item, "context." + CONTEXT_PROPS.PREV),
            _a);
    },
    getSdStatus: function() {
        return SD_STATUS.DOES_NOT_EXIST;
    },
    getBiData: function() {
        return {
            id: null,
            name: null
        };
    },
    getSlug: function() {
        return '';
    },
    updateItemDataWithSlug: function(item) {
        return item;
    },
    getLegacySeoBlob: function(item) {
        var tags = updateValueByIdentifier([], IDENTIFIERS.TITLE, get(item, "context." + CONTEXT_PROPS.TITLE));
        tags = updateValueByIdentifier(tags, IDENTIFIERS.DESCRIPTION, get(item, "context." + CONTEXT_PROPS.DESCRIPTION));
        tags = updateValueByIdentifier(tags, IDENTIFIERS.OG_IMAGE, get(item, "context." + CONTEXT_PROPS.OG_IMAGE));
        tags = updateValueByIdentifier(tags, IDENTIFIERS.ROBOTS, ['noindex', 'false'].includes(get(item, "context." + CONTEXT_PROPS.INDEX_PAGE)) ?
            'noindex' :
            '');
        return {
            tags: tags
        };
    },
    getKeys: function() {
        return getKeys(IDs, userVisible);
    },
    getSdKeys: function() {
        return [];
    },
};

function getImage(item, options) {
    if (options === void 0) {
        options = {};
    }
    if (options.ignoreLegacy) {
        return get(item, "context." + CONTEXT_PROPS.SITE_OG_IMAGE) || '';
    } else {
        return (get(item, "context." + CONTEXT_PROPS.OG_IMAGE) ||
            get(item, "context." + CONTEXT_PROPS.SITE_OG_IMAGE));
    }
}

function getTitle(item, options) {
    if (options === void 0) {
        options = {};
    }
    if (!options.ignoreLegacy) {
        var title = get(item, "context." + CONTEXT_PROPS.TITLE);
        if (title) {
            return title;
        }
    }
    var isHomePage = getRawValue(item, "context." + CONTEXT_PROPS.IS_HOME_PAGE);
    if (isHomePage) {
        var siteName_1 = get(item, "context." + CONTEXT_PROPS.SITE_NAME);
        return siteName_1 || '';
    }
    var homePageTitle = get(item, "context." + CONTEXT_PROPS.HOME_PAGE_TITLE);
    var siteName = get(item, "context." + CONTEXT_PROPS.SITE_NAME);
    var pageName = get(item, "context." + CONTEXT_PROPS.PAGE_NAME);
    return [pageName, homePageTitle || siteName].filter(function(_) {
        return !!_;
    }).join(' | ');
}