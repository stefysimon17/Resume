'use strict'
const name = 'BaseDimensions'
const properties = {}


function register({
    engine,
    factory
} /*, frame*/ ) {
    /**
     * Dimensions base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number|String} [params.from.width]
     * @param {Number|String} [params.to.width]
     * @returns {TweenMax}
     */
    function animation(elements, duration = 0, delay = 0, params = {}) {
        return engine.tween(elements, {
            duration,
            delay,
            ...params
        }, [
            'width', 'height', 'top', 'left',
            'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
            'bottom', 'right', 'margin', 'padding',
            'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
            'paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft', 'zIndex'
        ])
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}