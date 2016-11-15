let _ = require('lodash');
let chai = require('chai');
let assert = chai.assert;
let expect = chai.expect;
let should = chai.should();
let Promise = require('bluebird');
let sinon = require('sinon');

describe('qtort-lib-app', function() {
    let App = require('../');

    beforeEach(function() {
        microservices = {
            call: sinon.stub().returns(() => Promise.resolve({})),
            send: sinon.stub().returns(() => Promise.resolve({})),
        };
    });

    describe('App', function() {
        let app;

        beforeEach(function() {
            app = new App();
        });

        describe('start', function() {
            _.forEach(['initializing', 'initialized', 'starting', 'started', 'ready'], function(eventName) {

                it('emits ' + eventName, function() {
                    let listener = sinon.spy();
                    app.on(eventName, listener);
                    return app.start()
                        .then(() => {
                            expect(listener.called).to.be.true;
                        });
                });
            });
        });

        describe('stop', function() {
            beforeEach(function() {
                return app.start();
            });

            _.forEach(['shutdown', 'shutdown-last', 'exit'], function(eventName) {

                it('emits ' + eventName, function() {
                    let listener = sinon.spy();
                    app.on(eventName, listener);
                    return app.stop()
                        .then(() => {
                            expect(listener.called).to.be.true;
                        });
                });
            });
        });
    });
});
