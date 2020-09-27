import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { throttle, mergeMap, mapTo, take } from 'rxjs/operators';
import { of, concat, timer, Observable } from 'rxjs';

/** @test {throttle} */
describe('throttle operator', () =>  {
  it('should immediately emit the first value in each time window', () =>  {
    const e1 =   hot('-a-xy-----b--x--cxxx-|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----|                ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-a--------b-----c----|';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should simply mirror the source if values are not emitted often enough', () =>  {
    const e1 =   hot('-a--------b-----c----|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----|                ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-a--------b-----c----|';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should throttle with duration Observable using next to close the duration', () =>  {
    const e1 =   hot('-a-xy-----b--x--cxxx-|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----x-y-z            ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-a--------b-----c----|';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should interrupt source and duration when result is unsubscribed early', () =>  {
    const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
    const unsub =    '              !               ';
    const e1subs =   '^             !               ';
    const e2 =  cold( '------------------|          ');
    const e2subs =   ' ^            !               ';
    const expected = '-a-------------               ';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () =>  {
    const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
    const e1subs =   '^             !               ';
    const e2 =  cold( '------------------|          ');
    const e2subs =   ' ^            !               ';
    const expected = '-a-------------               ';
    const unsub =    '              !               ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      throttle(() =>  e2),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', () =>  {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                        !';
    const e2 =  cold('-----|                    ');
    const e2subs =  ['^    !                    ',
                   '      ^    !              ',
                   '            ^    !        ',
                   '                  ^    !  ',
                   '                        ^!'];
    const expected = 'a-----a-----a-----a-----a|';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  // TODO: this test is not compatible with the fix for this issue:
  // https://github.com/ReactiveX/rxjs/issues/5523
  // Prior to that fix, cold('|') was an observable that scheduled a complete
  // notification at zero milliseconds. That's entirely different to emitting a
  // complete notification from _within_ the subscribe call.
  it.skip('should mirror source if durations are always empty', () =>  {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                        !';
    const e2 =  cold('|');
    const expected = 'abcdefabcdefabcdefabcdefa|';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take only the first value emitted if duration is a never', () =>  {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                            !';
    const e2 =  cold('-');
    const e2subs =   '    ^                        !';
    const expected = '----a------------------------|';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe duration Observable when source raise error', () =>  {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa#');
    const e1subs =   '^                            !';
    const e2 =  cold('-');
    const e2subs =   '    ^                        !';
    const expected = '----a------------------------#';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error as soon as just-throw duration is used', () =>  {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^   !                         ';
    const e2 =  cold('#');
    const e2subs =   '    (^!)                      ';
    const expected = '----(a#)                      ';

    const result = e1.pipe(throttle(() =>  e2));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should throttle using durations of constying lengths', () =>  {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^                     !   ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------|        '),
              cold(                  '--|     '),
              cold(                     '----|')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                ',
                   '          ^      !        ',
                   '                  ^ !     ',
                   '                     ^!   '];
    const expected = 'a-----a---a-------a--a|   ';

    let i = 0;
    const result = e1.pipe(throttle(() =>  e2[i++]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should propagate error from duration Observable', () =>  {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^                !        ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------#        ')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                ',
                   '          ^      !        '];
    const expected = 'a-----a---a------#        ';

    let i = 0;
    const result = e1.pipe(throttle(() =>  e2[i++]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should propagate error thrown from durationSelector function', () =>  {
    const s1 = hot('--^--x--x--x--x--x--x--e--x--x--x--|');
    const s1Subs =   '^                    !';
    const n1 = cold( '----|');
    const n1Subs =  ['   ^   !                          ',
                     '         ^   !                    ',
                     '               ^   !              '];
    const exp =      '---x-----x-----x-----(e#)';

    let i = 0;
    const result = s1.pipe(throttle(() => {
      if (i++ === 3) {
        throw new Error('lol');
      }
      return n1;
    }));
    expectObservable(result).toBe(exp, undefined, new Error('lol'));
    expectSubscriptions(s1.subscriptions).toBe(s1Subs);
    expectSubscriptions(n1.subscriptions).toBe(n1Subs);
  });

  it('should complete when source does not emit', () =>  {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () =>  {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () =>  {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () =>  {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () =>  {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle by promise resolves', (done: MochaDone) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(50).pipe(mapTo(4))
    );
    const expected = [1, 2, 3, 4];

    e1.pipe(throttle(() =>  {
      return new Promise((resolve: any) => { resolve(42); });
    })).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift()); },
      () =>  {
        done(new Error('should not be called'));
      },
      () =>  {
        expect(expected.length).to.equal(0);
        done();
      }
    );
  });

  it('should raise error when promise rejects', (done: MochaDone) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(50).pipe(mapTo(4))
    );
    const expected = [1, 2, 3];
    const error = new Error('error');

    e1.pipe(throttle((x: number) => {
      if (x === 3) {
        return new Promise((resolve: any, reject: any) => { reject(error); });
      } else {
        return new Promise((resolve: any) => { resolve(42); });
      }
    })).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift()); },
      (err: any) => {
        expect(err).to.be.an('error', 'error');
        expect(expected.length).to.equal(0);
        done();
      },
      () =>  {
        done(new Error('should not be called'));
      }
    );
  });

  describe('throttle(fn, { leading: true, trailing: true })', () => {
    it('should immediately emit the first value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx------|');
      const e1subs =   '^                         !';
      const e2 =  cold( '----|                     ');
      const e2subs =  [' ^   !                     ',
                       '     ^   !                 ',
                       '          ^   !            ',
                       '              ^   !        ',
                       '                  ^   !    ',
                       '                      ^   !'];
      const expected = '-a---y----b---x---x---x---|';

      const result = e1.pipe(throttle(() =>  e2, { leading: true, trailing: true }));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });

    it('should work for individual values', () => {
      const s1 = hot('-^-x------------------|');
      const s1Subs =  '^                    !';
      const n1 = cold(  '------------------------|');
      const n1Subs = ['  ^                  !'];
      const exp =     '--x------------------|';

      const result = s1.pipe(throttle(() => n1, { leading: true, trailing: true }));
      expectObservable(result).toBe(exp);
      expectSubscriptions(s1.subscriptions).toBe(s1Subs);
      expectSubscriptions(n1.subscriptions).toBe(n1Subs);
    });
  });

  describe('throttle(fn, { leading: false, trailing: true })', () => {
    it('should immediately emit the first value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx------|');
      const e1subs =   '^                         !';
      const e2 =  cold( '----|                     ');
      const e2subs =  [' ^   !                     ',
                       '     ^   !                 ',
                       '          ^   !            ',
                       '              ^   !        ',
                       '                  ^   !    ',
                       '                      ^   !'];
      const expected = '-a---y----b---x---x---x---|';

      const result = e1.pipe(throttle(() =>  e2, { leading: true, trailing: true }));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });

    it('should work for individual values', () => {
      const s1 = hot('-^-x------------------|');
      const s1Subs =  '^                    !';
      const n1 = cold(  '------------------------|');
      const n1Subs = ['  ^                  !'];
      const exp =     '--x------------------|';

      const result = s1.pipe(throttle(() => n1, { leading: true, trailing: true }));
      expectObservable(result).toBe(exp);
      expectSubscriptions(s1.subscriptions).toBe(s1Subs);
      expectSubscriptions(n1.subscriptions).toBe(n1Subs);
    });

    it('should wait for trailing throttle to complete before completing, even if source completes', () => {
      const source = hot( '-^--x--------y---------|');
      const sourceSubs =   '^                     !';
      const duration = cold(  '------------------------|');
      const durationSubs = '   ^                       !';
      const exp =          '---x-----------------------(y|)';

      const result = source.pipe(throttle(() => duration, { leading: true, trailing: true }));
      expectObservable(result).toBe(exp);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(duration.subscriptions).toBe(durationSubs);
    })
  });

  // TODO: fix firehose unsubscription
  it.skip('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      throttle(() => of(0)),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
