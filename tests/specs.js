/**
 * test.js
 * Date: 12.11.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var chai = require('chai'),
    expect = chai.expect;

var sa = require('scaleapp'),
    Sandbox = require('sa-sandbox').Sandbox,
    eventsVersions = require('./../index');


describe('Mediator', function() {

    beforeEach(function () {
        this.core = new sa.Core(Sandbox);
        this.core.use(eventsVersions).boot().start();

        this.pkg = {
            name: 'foo',
            version: '2.3.1',
            _events: {
                listening: {
                    'event/foo': '^2.1',
                    'event/bar': '^2.0'
                },
                emits: {
                    'event/foo': '2.5',
                    'event/bar': '1.5'
                }
            }
        };
    });

    describe('after initialization', function () {

        it('should be defined', function () {
            expect(eventsVersions).to.be.ok;
        });

        it('should be registered in scaleApp core and Sandbox', function () {
            expect(this.core.createMediator).to.be.ok;
            expect(this.core.Sandbox.prototype.createMediator).to.be.ok;
        });

        it('should create mediator instance', function () {
            var mediator = this.core.createMediator();
            expect(mediator).to.be.ok;
            expect(mediator.updateFromPackage).to.be.ok;
        });

        it('should be updated from package obj', function () {
            var pkg = this.pkg;
            var mediator = this.core.createMediator();

            mediator.updateFromPackage(pkg);

            expect(mediator.eventsVer).to.be.equal(pkg._events);
            expect(mediator.moduleName).to.be.equal(pkg.name);
        });
    });

    describe('process', function () {

        beforeEach(function () {
            this.mediator = this.core.createMediator();
        });

        describe('simple mode', function () {

            it('should work as base mediator w/o next)', function (done) {
                this.mediator.on('event/baz', function (ev, channel) {
                    expect(ev).to.be.ok;
                    expect(ev._version).to.be.undefined;
                    done();
                });
                this.mediator.emit('event/baz', { some: 'value' });
            });

            it('should work as base mediator with next', function (done) {
                this.mediator.on('event/baz', function (ev, channel, next) {
                    expect(ev).to.be.ok;
                    expect(ev._version).to.be.undefined;
                    next();
                });
                this.mediator.emit('event/baz', { some: 'value' }, done);
            });
        });

        describe('versioned mode', function () {

            beforeEach(function () {
                this.mediator.updateFromPackage(this.pkg);
            });

            it('should emits versioned events', function (done) {
                var pkg = this.pkg;

                this.mediator.on('event/foo', function (ev, channel, next) {
                    expect(ev).to.be.ok;
                    expect(ev._version).to.be.equal(pkg._events.emits[channel]);
                    next();
                });
                this.mediator.emit('event/foo', { some: 'value' }, done);
            });

            it('should check events versions', function (done) {
                var pkg = this.pkg;

                this.mediator.on('event/bar', function (ev, channel, next) {
                    // not executed
                });
                this.mediator.emit('event/bar', { some: 'value' }, function (err) {
                    expect(err).to.be.ok;
                    expect(err.message).to.be.equal('Not supported [event/bar] channel version 1.5, ^2.0 expected.');
                    done();
                });

            });

            it('should check events versions w/o next', function (done) {
                var pkg = this.pkg;

                this.mediator.on('event/bar', function (ev, channel) {
                    // not executed
                    done(new Error('Should not executed'));
                });
                this.mediator.emit('event/bar', { some: 'value' });
                done();
            });
        });
    });

});