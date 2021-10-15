'use strict'
const name = 'PopOut'
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
    soft: 0.8,
    medium: 2.4,
    hard: 4
}

function register({
    factory
}) {
    /**
     * Pop Out to
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {'soft'|'medium'|'hard'} [power='hard'] 'soft' or 'medium' or 'hard'
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, {
        power = properties.schema.power.default,
        ...params
    } = {}) {
        const sequence = factory.sequence(params)
        const scale = scaleMap[power]

        sequence.add([
            factory.animate('BaseFade', elements, duration * 0.75, delay + duration * 0.25, {
                from: {
                    opacity: 1
                },
                to: {
                    autoAlpha: 0
                },
                ease: 'Sine.easeOut'
            }), // eslint-disable-line no-mixed-operators
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