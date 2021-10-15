'use strict'
const name = 'OutIn'
const properties = {
    defaultDuration: 0.7,

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
        stagger: {
            type: 'number',
            default: 0
        }
    }
}

function register({
    factory
}) {
    /**
     * Fade out an element and after it disappears fade in the next element.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {Object} [stagger=0] stagger the animation
     * @param {Object} [sourceEase='Strong.easeOut'] the ease function of the animation
     * @param {Object} [destEase='Strong.easeIn'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function transition(sourceElements, destElements, duration, delay, {
        stagger = 0,
        sourceEase = 'Strong.easeOut',
        destEase = 'Strong.easeIn',
        ...params
    } = {}) {
        const sequence = factory.sequence(params)
        sequence.add([
            factory.animate('BaseFade', sourceElements, duration, delay, {
                from: {
                    opacity: 1
                },
                to: {
                    opacity: 0
                },
                ease: sourceEase,
                stagger
            }),
            factory.animate('BaseFade', destElements, duration, delay, {
                from: {
                    opacity: 0
                },
                to: {
                    opacity: 1
                },
                ease: destEase,
                stagger
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