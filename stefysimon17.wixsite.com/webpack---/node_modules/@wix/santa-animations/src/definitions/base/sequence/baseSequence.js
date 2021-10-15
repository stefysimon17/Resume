'use strict'
const name = 'BaseSequence'
const properties = {}

function register({
    engine,
    factory
}) {
    /**
     * Sequence base animation object
     * @param {Object} params TimelineMax optional params
     * @returns {TimelineMax}
     */
    function sequence(params) {
        return engine.timeline(params, [])
    }

    factory.registerAnimation(name, sequence, properties)
}

module.exports = {
    name,
    properties,
    register
}