'use strict'
const name = 'HeaderHideToTop'
const properties = {
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
        compMeasures: {
            type: 'object',
            properties: {
                height: {
                    type: 'number'
                }
            }
        }
    }
}

const GUTTER = 5 // px

function register({
    factory
}) {
    function animation(elements, duration, delay, {
        compMeasures,
        ...params
    }) {
        const sequence = factory.sequence(params)
        const headerHeight = compMeasures.height

        sequence.add(factory.animate('BasePosition', elements, duration, delay, {
            ease: 'Linear.easeNone',
            from: {
                y: 0
            }, // will affect CSS attribute "transform: matrix(1, 0, 0, 1, 0, 0)", and NOT "top: 0" (top is handled by the measure-patcher)
            to: {
                y: -1 * (headerHeight + GUTTER)
            }
        }))

        // hide additional stuff overflowing the header, such as shadow or member's area menu when open
        sequence.add(factory.animate('BaseFade', elements, 0.2, 0.1, {
            ease: 'Linear.easeIn',
            to: {
                autoAlpha: 0
            }
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