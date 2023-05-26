import { of, toArray } from 'rxjs';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(toArray()); // $ExpectType Observable<number[]>
});

it('should enforce types', () => {
  const o = of(1).pipe(toArray('')); // $ExpectError
});
