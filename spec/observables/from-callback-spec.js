/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.fromCallback', function () {
  it('should emit one value from a callback', function (done) {
    function callback (datum, cb) {
      cb(datum);
    }
    var cbToObs = Observable.fromCallback(callback);

    cbToObs(42)
      .subscribe(function (x) {
        expect(x).toBe(42);
      }, function () {
        done.fail('should not be called');
      },
      done);
  });

  it('should emit one value chosen by a selector', function (done) {
    function callback (datum, cb) {
      cb(null, datum);
    }
    var cbToObs = Observable.fromCallback(callback, null, function (err, datum) { return datum; });

    cbToObs(42)
      .subscribe(function (x) {
        expect(x).toBe(42);
      }, function () {
        done.fail('should not be called');
      },
      done);
  });

  it('should override `this` in the callback', function (done) {
    function callback (cb) {
      cb(this.value);
    }
    var cbToObs = Observable.fromCallback(callback, {value: 42});

    cbToObs()
      .subscribe(function (x) {
        expect(x).toBe(42);
      }, function () {
        done.fail('should not be called');
      },
      done);
  });

  it('should emit an error when the selector throws', function (done) {
    function callback (cb) {
      cb(42);
    }
    var cbToObs = Observable.fromCallback(callback, null, function (err) { throw new Error('Yikes!'); });

    cbToObs()
      .subscribe(function () {
        // Considered a failure if we don't go directly to err handler
        done.fail('should not be called');
      },
      function (err) {
        expect(err.message).toBe('Yikes!');
        done();
      },
      function () {
        // Considered a failure if we don't go directly to err handler
        done.fail('should not be called');
      }
      );
  });

  it('should not emit, throw or complete if immediately unsubscribed', function (done) {
    var nextSpy = jasmine.createSpy('next');
    var throwSpy = jasmine.createSpy('throw');
    var completeSpy = jasmine.createSpy('complete');
    var timeout;
    function callback (datum, cb) {
      // Need to cb async in order for the unsub to trigger
      timeout = setTimeout(function () {
        cb(datum);
      });
    }
    var subscription = Observable.fromCallback(callback)(42)
      .subscribe(nextSpy, throwSpy, completeSpy);
    subscription.unsubscribe();

    setTimeout(function () {
      expect(nextSpy).not.toHaveBeenCalled();
      expect(throwSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();

      clearTimeout(timeout);
      done();
    });
  });
});