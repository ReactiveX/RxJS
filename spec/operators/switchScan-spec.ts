import { expect } from 'chai';
import { concat, defer, Observable, of } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { switchScan, map, mergeMap, takeWhile } from 'rxjs/operators';

/** @test {switchScan} */
describe('switchScan', () => {
  it('should map-and-flatten each item to an Observable while passing the accumulated value', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-yz-z-z---|';
    const values = {x: 10, y: 40, z: 90};

    const result = e1.pipe(switchScan((acc, x) => e2.pipe(map(i => i * Number(x) + acc)), 0));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not pass seed when undefined', () => {
    const seeds: number[] = [];

    of(1, 3, 5).pipe(
      switchScan((acc, x) => {
        seeds.push(acc);
        return of(10).pipe(map(v => v * x + acc));
      }, 0),
    ).subscribe();

    expect(seeds).to.deep.equal([0, 10, 40]);
  });

  it('should unsub inner observables', () => {
    const unsubbed: string[] = [];

    of('a', 'b').pipe(
      switchScan((acc, x) =>
        new Observable<string>((subscriber) => {
          subscriber.complete();
          return () => {
            unsubbed.push(x);
          };
        }),
        null
      )
    ).subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch inner cold observables', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^                 !';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                            !        ';
    const expected = '-----------a--b--c----f---g---h---i--|';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when projection throws', () => {
    const e1 =   hot('-------x-----y---|');
    const e1subs =   '^      !          ';
    const expected = '-------#          ';
    function project(): any[] {
      throw 'error';
    }

    expectObservable(e1.pipe(switchScan(project, null))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, outer is unsubscribed early', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^ !                ';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                    !                ';
    const unsub =    '                     !                ';
    const expected = '-----------a--b--c----                ';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^ !                ';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                    !                ';
    const expected = '-----------a--b--c----                ';
    const unsub =    '                     !                ';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(
      mergeMap(x => of(x)),
      switchScan((acc, value) => observableLookup[value], null),
      mergeMap(x => of(x)),
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = concat(
      defer(() => {
        sideEffects.push(1);
        return of(1);
      }),
      defer(() => {
        sideEffects.push(2);
        return of(2);
      }),
      defer(() => {
        sideEffects.push(3);
        return of(3);
      })
    );

    of(null).pipe(
      switchScan(() => synchronousObservable, null),
      takeWhile((x) => x != 2) // unsubscribe at the second side-effect
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should switch inner cold observables, inner never completes', () => {
    const x =   cold(         '--a--b--c--d--e--|          ');
    const xsubs =    '         ^         !                 ';
    const y =   cold(                   '---f---g---h---i--');
    const ysubs =    '                   ^                 ';
    const e1 =   hot('---------x---------y---------|       ');
    const e1subs =   '^                            !       ';
    const expected = '-----------a--b--c----f---g---h---i--';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch to the second inner observable', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =    '         (^!)                 ';
    const y =   cold(         '---f---g---h---i--|  ');
    const ysubs =    '         ^                 !  ';
    const e1 =   hot('---------(xy)----------------|');
    const e1subs =   '^                            !';
    const expected = '------------f---g---h---i----|';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, one inner throws', () => {
    const x =   cold(         '--a--b--#--d--e--|          ');
    const xsubs =    '         ^       !                   ';
    const y =   cold(                   '---f---g---h---i--');
    const ysubs: string[] = [];
    const e1 =   hot('---------x---------y---------|       ');
    const e1subs =   '^                !                   ';
    const expected = '-----------a--b--#                   ';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner hot observables', () => {
    const x =    hot('-----a--b--c--d--e--|                 ');
    const xsubs =    '         ^         !                  ';
    const y =    hot('--p-o-o-p-------------f---g---h---i--|');
    const ysubs =    '                   ^                 !';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                            !        ';
    const expected = '-----------c--d--e----f---g---h---i--|';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and empty', () => {
    const x = cold('|');
    const y = cold('|');
    const xsubs =    '         (^!)                 ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                            !';
    const expected = '-----------------------------|';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and never', () => {
    const x = cold('|');
    const y = cold('-');
    const xsubs =    '         (^!)                 ';
    const ysubs =    '                   ^          ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                            !';
    const expected = '------------------------------';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner never and empty', () => {
    const x = cold('-');
    const y = cold('|');
    const xsubs =    '         ^         !          ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                            !';
    const expected = '-----------------------------|';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner never and throw', () => {
    const x = cold('-');
    const y = cold('#', undefined, 'sad');
    const xsubs =    '         ^         !          ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                  !          ';
    const expected = '-------------------#          ';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and throw', () => {
    const x = cold('|');
    const y = cold('#', undefined, 'sad');
    const xsubs =    '         (^!)                 ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                  !          ';
    const expected = '-------------------#          ';

    const observableLookup: Record<string, Observable<string>> = { x, y };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const result = e1.pipe(switchScan((acc, value) => of(value), ''));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const result = e1.pipe(switchScan((acc, value) => of(value), ''));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const result = e1.pipe(switchScan((acc, value) => of(value), ''));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer error', () => {
    const x =   cold(         '--a--b--c--d--e--|');
    const xsubs =    '         ^         !       ';
    const e1 =   hot('---------x---------#       ');
    const e1subs =   '^                  !       ';
    const expected = '-----------a--b--c-#       ';

    const observableLookup: Record<string, Observable<string>> = { x: x };

    const result = e1.pipe(switchScan((acc, value) => observableLookup[value], null));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should create a new seed for each subscriber', () => {
    const seeds: string[] = [];
    const observer = (value: string) => seeds.push(value);

    const source = of('a', 'b').pipe(
      switchScan((acc, x) => of(acc + x), '')
    );

    source.subscribe(observer);
    source.subscribe(observer);

    expect(seeds).to.deep.equal(['a', 'ab', 'a', 'ab']);
  });

  it('should pass index to the accumulator function', () => {
    const indices: number[] = [];

    of('a', 'b', 'c', 'd').pipe(
      switchScan((acc, x, index) => {
        indices.push(index);
        return of();
      }, ''),
    ).subscribe();

    expect(indices).to.deep.equal([0, 1, 2, 3]);
  });
});