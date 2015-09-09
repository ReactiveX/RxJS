var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

  var oldCatchWithImmediateScheduler = RxOld.Observable.throw(new Error('error'), RxOld.Scheduler.immediate).catch(RxOld.Observable.of(25, RxOld.Scheduler.immediate));
  var newCatchWithImmediateScheduler = RxNew.Observable.throw(new Error('error')).catch(RxNew.Observable.of(25));

  return suite
    .add('old catch with immediate scheduler', function () {
      oldCatchWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new catch with immediate scheduler', function () {
      newCatchWithImmediateScheduler.subscribe(_next, _error, _complete);
    });

  function _next(x) { }
  function _error(e){ }
  function _complete(){ }
};