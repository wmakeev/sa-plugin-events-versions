/**
 * index
 * Date: 11.11.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var semver = require('semver');

var Mediator = function (baseMediator) {
    this.baseMediator = baseMediator;
    this.channels = {};
    return this;
};

Mediator.prototype.updateFromPackage = function (pkg) {
    this.eventsVer = pkg._events;
    this.moduleName = pkg.name;
};

Mediator.prototype.on = function () {
    var that = this;

    if (arguments[0] && arguments[1]) {
        var name = arguments[0],
            handler = arguments[1];

        that.channels[name] = handler;

        arguments[1] = function (data, channel, next) {
            //TODO cascadeChannels
            //TODO brotype
            if (data._version && that.eventsVer && that.eventsVer.listening[channel]) {
                var _version = that.eventsVer.listening[channel];
                if (!semver.satisfies(data._version + '.0', _version)) {
                    //TODO Error type
                    var err = new Error([
                        'Not supported [', channel, "] channel version ",
                        data._version, ', ', _version, ' expected.'].join(''));

                    return next(err);
                }
            }
            //TODO Context?
            handler.apply(null, arguments);
        };
    }

    that.baseMediator.on.apply(that.baseMediator, arguments);
};

// 'generated/file/xlsx', emmitData, next
Mediator.prototype.emit = function () {
    if (arguments[0] && arguments[1]) {

        //TODO brotype
        if (this.eventsVer && this.eventsVer.emits && this.eventsVer.emits[arguments[0]]) {
            arguments[1]._version = this.eventsVer.emits[arguments[0]];
            arguments[1]._name = this.moduleName;
        }

        this.baseMediator.emit.apply(this.baseMediator, arguments);
    }
};

Mediator.prototype.off = function () {
    //TODO Mediator.prototype.off
};

var createMediator = function () {
    return new Mediator(this);
};

var eventsVersions = function (core, options) {

    core.createMediator =
        core.Sandbox.prototype.createMediator =
            createMediator;
};

module.exports = eventsVersions;