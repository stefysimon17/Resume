'use strict'
const name = 'CollapseOut'
const properties = {
    groups: ['exit', 'animation'],
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
        power: {
            type: 'string',
            enum: ['soft', 'medium', 'hard'],
            default: 'hard'
        }
    }
}

const scaleMap = {
    soft: 0.85,
    medium: 0.4,
    hard: 0
}

function register({
    factory
}) {
    /**
     * Collapse Out
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {'soft'|'medium'|'hard'} [power='hard'] 'soft', 'medium', 'hard'
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, {
        power = properties.schema.power.default,
        ...params
    } = {}) {
        const sequence = factory.sequence(params)
        const scale = scaleMap[power]

        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {
                from: {
                    opacity: 1
                },
                to: {
                    autoAlpha: 0
                },
                ease: 'Cubic.easeOut'
            }),
            factory.animate('BaseScale', elements, duration, delay, {
                to: {
                    scale
                },
                ease: 'Sine.easeOut'
            })
        ])
        return sequence.get()
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}