/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.findIndex()', function () {
  function truePredicate(x) {
    return true;
  }

  it('should not emit if source does not emit', function () {
    var source = hot('-');
    var subs =       '^';
    var expected =   '-';

    expectObservable(source.findIndex(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return negative index if source is empty to match predicate', function () {
    var source = cold('|');
    var subs =        '(^!)';
    var expected =    '(x|)';

    var result = source.findIndex(truePredicate);

    expectObservable(result).toBe(expected, {x: -1});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return index of element from source emits single element', function () {
    var sourceValue = 1;
    var source = hot('--a--|', { a: sourceValue });
    var subs =       '^ !   ';
    var expected =   '--(x|)';

    var predicate = function (value) {
      return value === sourceValue;
    };

    expectObservable(source.findIndex(predicate)).toBe(expected, { x: 0 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return negative index if element does not match with predicate', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^          !';
    var expected =   '-----------(x|)';

    var predicate = function (value) {
      return value === 'z';
    };

    expectObservable(source.findIndex(predicate)).toBe(expected, { x: -1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise if source raise error while element does not match with predicate', function () {
    var source = hot('--a--b--#');
    var subs =       '^       !';
    var expected =   '--------#';

    var predicate = function (value) {
      return value === 'z';
    };

    expectObservable(source.findIndex(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if predicate throws error', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^ !';
    var expected =   '--#';

    var predicate = function (value) {
      throw 'error';
    };

    expectObservable(source.findIndex(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});