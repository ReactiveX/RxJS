/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('count', function () {
  it('should be never when source is never', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.count()).toBe(expected);
  });

  it('should be zero when source is empty', function () {
    var e1 = Observable.empty();
    var expected = '(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 0 });
  });

  it('should be never when source doesn\'t complete', function () {
    var e1 = hot('--x--^--y--');
    var expected = '-';

    expectObservable(e1.count()).toBe(expected);
  });

  it('should be zero when source doesn\'t have values', function () {
    var e1 = hot('-x-^---|');
    var expected =  '----(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 0 });
  });

  it('should count the unique value of an observable', function () {
    var e1 = hot('-x-^--y--|');
    var expected =  '------(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 1 });
  });

  it('should count the values of an observable', function () {
    var source = hot('--a--b--c--|');
    var expected =   '-----------(x|)';

    expectObservable(source.count()).toBe(expected, {x: 3});
  });

  it('should work with error', function () {
    var e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    var expected =  '---------#';

    expectObservable(e1.count()).toBe(expected, null, 'too bad');
  });

  it('should work with throw', function () {
    var e1 = Observable.throw(new Error('too bad'));
    var expected = '#';

    expectObservable(e1.count()).toBe(expected, null, new Error('too bad'));
  });
});
