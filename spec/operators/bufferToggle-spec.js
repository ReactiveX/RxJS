/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferToggle', function () {
  it('should emit buffers that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument', function (done) {
    Observable.interval(100).take(10)
      .bufferToggle(Observable.timer(320).mapTo('test'), function (n) {
        expect(n).toBe('test');
        return Observable.timer(320);
      })
      .subscribe(function (w) {
        expect(w).toEqual([3, 4, 5])
      }, null, done);
  }, 2000);
});