/**
 * Creates a shallow copy of a given advanced seo data.
 *
 * @param {Object} value advanced seo data to clone.
 */
export function clone(value) {
    return {
        tags: (value || {}).tags || [],
    };
}