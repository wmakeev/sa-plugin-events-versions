/**
 * index
 * Date: 11.11.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var eventsVersions = function(core, options, done){

    core.Sandbox.prototype.emmit = function (pkg) {

    };

    // define a method that gets called when a module starts
    var onModuleInit = function(instanceSandbox, options, done){

        // e.g. define sandbox methods dynamically
        if (options.mySwitch){
            instanceSandbox.appendFoo = function(){
                core.getContainer.append("foo");
            };
        }

        done();
    };

    var onModuleDestroy = function(done){
        done();
    };

    return {
        init: onModuleInit,
        destroy: onModuleDestroy
    };

};

module.exports = eventsVersions;