'use strict'
const name = 'BaseSkew'
const properties = {}

function register({
    engine,
    factory
} /*, frame*/ ) {
    /**
     * Skew animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number|String} [params.from.skewX]
     * @param {Number|String} [params.from.skewY]
     * @param {Number|String} [params.to.skewX]
     * @param {Number|String} [params.to.skewY]
     * @returns {TweenMax}
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, {
            duration,
            delay,
            ...params
        }, ['skewX', 'skewY'])
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}