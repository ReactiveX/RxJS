import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(catchError((() => of(4, 5, 6)))); // $ExpectType Observable<number>
});

it('should infer correctly when returning another type', () => {
  const o = of(1, 2, 3).pipe(catchError((() => of('a', 'b', 'c')))); // $ExpectType Observable<string | number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(catchError()); // $ExpectError
});

it('should enforce type of caught', () => {
  const o = of(1, 2, 3).pipe(catchError((err, caught: Observable<string>) => of('a', 'b', 'c'))); // $ExpectError
});
