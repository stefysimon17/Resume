'use strict'
const name = 'BaseFade'
const properties = {}

function register({
    engine,
    factory
} /*, frame*/ ) {
    /**
     * Fade base animation object (defaults to always use 'autoAlpha' which treats visibility:hidden as opacity:0)
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Object} to
     * @param {Object} from
     * @param {Number} [from.opacity]
     * @param {Number} [from.autoAlpha]
     * @param {Number} [to.opacity]
     * @param {Number} [to.autoAlpha]
     * @param {boolean} [lazy=false] GSAP 1.12.0 introduced 'lazy' rendering. we need the default to be false for opacity.
     * @returns {TweenMax}
     */
    function animation(elements, duration = 0, delay = 0, {
        lazy = false,
        to = {},
        from = {},
        ...params
    } = {}) {
        if (to.opacity > 0) {
            to.autoAlpha = to.opacity
            delete to.opacity
        }

        if (from.opacity > 0) {
            from.autoAlpha = from.opacity
            delete from.opacity
        }

        return engine.tween(elements, {
            duration,
            delay,
            lazy,
            to,
            from,
            ...params
        }, ['opacity', 'autoAlpha'])
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}