/**
 * Extends the node.js events module with additional functionality.
 * @module qtort-lib-app/lib/events
 */

'use strict';
let events = require('events');

/**
 * A promise aware event emitter.
 * @class
 * @extends EventEmitter
 */
class EventEmitter2 extends events.EventEmitter {
    /**
     * Initializes a new instance of the EventEmitter2 class.
     * @param options Options for configuring the emitter.
     * @param options.Promise Override promise library used by the emitter.
     */
    constructor(options) {
        options = options || {};
        super();
        this._Promise = options.Promise || require('bluebird');
    }

    /**
     * Emits the specified event with arguments.
     * @param eventName The string identifier of the desired event.
     */
    emit(eventName) {
        var listeners = this.listeners(eventName);
        return this._Promise
            .each(listeners, function(listener) {
                return listener.apply(this, arguments);
            })
            .return(listeners.length > 0);
    }
}

module.exports = {
    EventEmitter: events.EventEmitter,
    EventEmitter2: EventEmitter2,
};
