'use strict'
const name = 'Shrink'
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
     * Shrink (clip) transition
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {Object} [stagger=0] stagger the animation
     * @param {Object} [sourceEase='Sine.easeInOut'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function transition(sourceElements, destElements, duration, delay, {
        stagger = 0,
        sourceEase = 'Sine.easeInOut',
        ...params
    } = {}) {
        const clipPath = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)'
        const webkitClipPath = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)'
        const sequence = factory.sequence(params)

        sequence.add(factory.animate('BaseFade', destElements, 0, delay, {
            to: {
                opacity: 1
            },
            clearProps: 'clip,clipPath,webkitClipPath,scale'
        }))

        /**
         * Dec 30 2018: Fallback for IE / Edge which does not support clipPath. One day we could delete this
         */
        if (typeof sourceElements[0].style.clipPath === 'undefined') {
            sequence.add(factory.animate('BaseScale', sourceElements, duration, delay, {
                to: {
                    scale: 0
                },
                ease: sourceEase,
                stagger
            }))
        } else {
            sequence.add(factory.animate('BaseClipPath', sourceElements, duration, delay, {
                to: {
                    webkitClipPath,
                    clipPath
                },
                ease: sourceEase,
                stagger
            }))
        }
        return sequence.get()
    }

    factory.registerTransition(name, transition, properties)
}

module.exports = {
    name,
    properties,
    register
}