'use strict';

let EventEmitter = require('events').EventEmitter;

class EventEmitter2 extends EventEmitter {
    constructor(options) {
        options = options || {};
        super();
        this._Promise = options.Promise || require('bluebird');
    }

    emit(eventName, _args_) {
        var listeners = this.listeners(eventName);
        return this._Promise
            .each(listeners, function(listener) {
                return listener.apply(this, arguments);
            })
            .return(listeners.length > 0);
    }
}

class App extends EventEmitter2 {
    constructor(options) {
        options = options || {};
        options.Promise = options.Promise || require('bluebird');
        options.shutdownOn = options.shutdownOn || ['SIGINT', 'SIGQUIT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'];
        super(options);

        this._log = options.logging ? options.logging.getLogger('qtort-lib-app') : console;
        this._Promise = options.Promise;
        this.options = options;

        this.when = {
            ready: new this._Promise(resolve => this.once('ready', resolve)),
            shutdown: new this._Promise(resolve => this.once('shutdown', resolve)),
        };
    }

    start() {
        if (this._log.debug) { this._log.debug('start| starting'); }

        if (this._log.debug) { this._log.debug('start| Setting up signal/exit handlers:', this.options.shutdownOn); }
        this.options.shutdownOn.forEach(signal => {
            let signalHandler = () => {
                this._log.warn('Received signal:', signal);
                this.shutdown()
                    .delay(10)
                    .tap(function() {
                        process.exit();
                    })
                    .done();
            }
            let shutdownHandler = () => {
                process.removeListener(signal, signalHandler);
                this.removeListener('shutdown', shutdownHandler);
            }

            process.on(signal, signalHandler);
            this.on('stopping', shutdownHandler);
        });

        return this._Promise
            .try(() => this.emit('initializing'))
            .then(() => this.emit('initialized'))
            .then(() => this.emit('starting'))
            .then(() => this.emit('started'))
            .then(() => this.emit('ready'))
            .return(undefined);
    }

    stop() {
        if (this._log.debug) {
            this._log.debug('stop| stopping');
        }
        return this._Promise
            .try(() => this.emit('stopping'))
            .then(() => this.emit('stopped'))
            .then(() => this.emit('shutdown'))
            .then(() => this.emit('shutdown-last'))
            .then(() => this.emit('exit'))
            .return(undefined);
    }
}

module.exports = App;
