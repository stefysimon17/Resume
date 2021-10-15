'use strict'
const name = 'BaseAttribute'
const properties = {}

function register({
    engine,
    factory
} /*, frame*/ ) {
    /**
     * Object enumeration base animation object
     * @param {Array<object>|object} elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params

     * @returns {TweenMax}
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, {
            duration,
            delay,
            ...params
        }, ['attr'])
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}