'use strict'

const name = 'GlideIn'
const properties = {
    hideOnStart: true,
    viewportThreshold: 0.15,

    groups: ['entrance', 'animation'],
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
        angle: {
            type: 'number',
            min: 0,
            max: 360,
            default: 0
        },
        distance: {
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
     * GlideIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {number} [angle=0] 0 - 360
     * @param {number} [distance=0] 0 - 300
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, {
        angle = properties.schema.angle.default,
        distance = properties.schema.distance.default,
        ...params
    } = {}) {
        const angleInRad = angle * Math.PI / 180

        const transformX = Math.sin(angleInRad) * distance
        const transformY = Math.cos(angleInRad) * distance * -1
        const fadeDuration = 0

        const sequence = factory.sequence(params)
        sequence.add([
            factory.animate('BaseFade', elements, fadeDuration, 0, {
                from: {
                    opacity: 0
                },
                to: {
                    opacity: 1
                },
                ease: 'Sine.easeIn'
            }),
            factory.animate('BasePosition', elements, duration, delay, {
                from: {
                    x: transformX,
                    y: transformY
                },
                ease: 'Sine.easeInOut'
            })
        ], 0)

        return sequence.get()
    }

    factory.registerAnimation(name, animation, properties)
}

module.exports = {
    name,
    properties,
    register
}