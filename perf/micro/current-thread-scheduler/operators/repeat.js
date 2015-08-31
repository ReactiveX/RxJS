var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldRepeatWithCurrentThreadScheduler = RxOld.Observable.just(25, RxOld.Scheduler.currentThread).repeat(5, RxOld.Scheduler.currentThread);
    var newRepeatWithCurrentThreadScheduler = RxNew.Observable.just(25, RxNew.Scheduler.immediate).repeat(5, RxNew.Scheduler.immediate);

    return suite
        .add('old repeat with current thread scheduler', function () {
            oldRepeatWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new repeat with current thread scheduler', function () {
            newRepeatWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });

    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};