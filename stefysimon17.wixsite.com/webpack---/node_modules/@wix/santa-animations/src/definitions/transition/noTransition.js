'use strict'
const name = 'NoTransition'
const properties = {
    defaultDuration: 0,
    schema: {
        duration: {
            type: 'number',
            min: 0,
            default: 0
        },
        delay: {
            type: 'number',
            min: 0,
            default: 0
        }
    }
}

function register({
    factory
}) {
    /**
     * Empty transition.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters.
     * @returns {TimelineMax}
     */
    function transition(sourceElements, destElements, duration, delay, params) {
        const sequence = factory.sequence(params)
        sequence.add([
            factory.animate('BaseNone', sourceElements, duration, delay),
            factory.animate('BaseNone', destElements, duration, delay)
        ])

        return sequence.get()
    }

    factory.registerTransition(name, transition, properties)
}

module.exports = {
    name,
    properties,
    register
}