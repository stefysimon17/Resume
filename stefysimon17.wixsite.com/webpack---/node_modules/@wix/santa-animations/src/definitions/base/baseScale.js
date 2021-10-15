'use strict'
const name = 'BaseScale'
const properties = {}

function register({
    engine,
    factory
} /*, frame*/ ) {
    /**
     * Scale base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number} [params.from.scale]
     * @param {Number} [params.to.scale]
     * @returns {TweenMax}
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, {
            duration,
            delay,
            ...params
        }, ['scale', 'scaleX', 'scaleY'])
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}