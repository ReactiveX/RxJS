import { EMPTY, of, defaultIfEmpty, map } from 'rxjs';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty()); // $ExpectError
  const o2 = of(undefined).pipe(defaultIfEmpty(undefined)); // $ExpectType Observable<undefined>
});

it('should infer correctly with a defaultValue', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty(47)); // $ExpectType Observable<number>
});

it('should infer correctly with a different type of defaultValue', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty<number, string>('carbonara')); // $ExpectType Observable<string | number>
  const o2 = of(1, 2, 3).pipe(defaultIfEmpty('carbonara')); // $ExpectType Observable<string | number>
});

it('should infer correctly with a subtype passed through parameters', () => {
  const o = of(true, false).pipe(map(p => p), defaultIfEmpty(true)); // $ExpectType Observable<boolean>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty(4, 5)); // $ExpectError
});

it('should handle Observable<never> appropriately', () => {
  const o = EMPTY.pipe(defaultIfEmpty('blah')); // $ExpectType Observable<string>
})
