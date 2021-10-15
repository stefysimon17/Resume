'use strict'
const name = 'FadeOut'
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
        }
    }
}

function register({
    factory
}) {
    /**
     * FadeOut to opacity 0 animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        const sequence = factory.sequence(params)

        sequence.add(factory.animate('BaseFade', elements, duration, delay, {
            to: {
                autoAlpha: 0
            },
            ease: 'Cubic.easeIn'
        }))
        return sequence.get()
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}