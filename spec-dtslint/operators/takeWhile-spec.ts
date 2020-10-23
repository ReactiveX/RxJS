import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

it('should support a user-defined type guard', () => {
  const o = of('foo').pipe(takeWhile((s): s is 'foo' => true)); // $ExpectType Observable<"foo">
});

it('should support a user-defined type guard with inclusive option', () => {
  const o = of('foo').pipe(takeWhile((s): s is 'foo' => true, false)); // $ExpectType Observable<"foo">
});

it('should support a predicate', () => {
  const o = of('foo').pipe(takeWhile(s => true)); // $ExpectType Observable<string>
});

it('should support a predicate with inclusive option', () => {
  const o = of('foo').pipe(takeWhile(s => true, true)); // $ExpectType Observable<string>
});

it('should properly support Boolean constructor', () => {
  const a = of(false as const, 0 as const, -0 as const, 0n as const, '' as const, null, undefined).pipe(takeWhile(Boolean)); // $ExpectType Observable<never>
  // This is a weird one... but `Falsy` is equivalent here. I think this is TS trying to be "nice"?
  const b = of(false as const, 0 as const, -0 as const, 0n as const, '' as const, null, undefined).pipe(takeWhile(Boolean, true)); // $ExpectType Observable<Falsy>
  const c = of(false as const, 0 as const, 'hi' as const, -0 as const, 0n as const, '' as const, null, undefined).pipe(takeWhile(Boolean)); // $ExpectType Observable<false | "" | 0 | 0n | "hi" | null | undefined>
  const d = of(false as const, 0 as const, 'hi' as const, -0 as const, 0n as const, '' as const, null, undefined).pipe(takeWhile(Boolean, true)); // $ExpectType Observable<false | "" | 0 | 0n | "hi" | null | undefined>
  const e = of(1, ['hi'], false as const, 0 as const, -0 as const, 0n as const, '' as const, null, undefined).pipe(takeWhile(Boolean, true)); // $ExpectType Observable<number | false | "" | 0n | string[] | null | undefined>
});

it('should properly handle predicates that always return false', () => {
  const a = of(1, 2, 3).pipe(takeWhile(() => false as const)); // $ExpectType Observable<never>
  const b = of(1, 2, 3).pipe(takeWhile(() => false as const, true)); // $ExpectType Observable<never>
});