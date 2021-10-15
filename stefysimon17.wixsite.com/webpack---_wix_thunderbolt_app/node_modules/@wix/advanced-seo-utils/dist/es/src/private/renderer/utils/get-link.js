import {
    TAG_TYPES
} from '../../types/TagTypes';
export function getLink(context, name, rel) {
    if (context[name]) {
        return [{
            type: TAG_TYPES.LINK,
            props: {
                rel: rel,
                href: context[name],
            },
        }, ];
    }
    return [];
}