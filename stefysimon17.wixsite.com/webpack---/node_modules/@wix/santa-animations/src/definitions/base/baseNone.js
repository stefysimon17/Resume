'use strict'
const name = 'BaseNone'
const properties = {}

function register({
    engine,
    factory
} /*, frame*/ ) {
    /**
     * Empty animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @returns {TweenMax}
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        const to = {}

        return engine.tween(elements, {
            duration,
            delay,
            ...params,
            to
        }, [])
    }

    factory.registerAnimation(name, animation, properties)
}


module.exports = {
    name,
    properties,
    register
}