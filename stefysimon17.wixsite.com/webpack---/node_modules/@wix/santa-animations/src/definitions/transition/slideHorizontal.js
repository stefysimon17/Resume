'use strict'
const name = 'SlideHorizontal'
const properties = {
    defaultDuration: 0.6,

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
        },
        reverse: {
            type: 'boolean',
            default: false
        },
        width: {
            type: 'number',
            min: 0
        }
    }
}

function register({
    factory
}) {
    /**
     * Slide an element out and another in from left tot right.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Optional Timeline parameters.
     * @param {boolean} [reverse=false] reverse direction to be from right to left
     * @param {Number} [width] optional width value, if not passed will use the width of the first element in sourceElements
     * @param {Object} [ease='Strong.easeInOut'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function transition(sourceElements, destElements, duration, delay, {
        reverse = properties.schema.reverse.default,
        width,
        ease = 'Strong.easeInOut',
        ...params
    } = {}) {
        const direction = reverse ? -1 : 1
        width = width || (sourceElements.length ? sourceElements[0].offsetWidth : sourceElements.offsetWidth)

        const sequence = factory.sequence(params)

        sequence.add([
            factory.animate('BaseFade', destElements, 0, delay, {
                to: {
                    opacity: 1
                },
                immediateRender: false
            }),
            factory.animate('BasePosition', sourceElements, duration, delay, {
                from: {
                    x: 0
                },
                to: {
                    x: -width * direction
                },
                ease
            }),
            factory.animate('BasePosition', destElements, duration, delay, {
                from: {
                    x: width * direction
                },
                to: {
                    x: 0
                },
                ease
            })
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