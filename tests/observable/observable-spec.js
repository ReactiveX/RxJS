// import { Observable } from 'src/observable/observable';
import { Observable } from 'src/index';

describe('Observable', () => {
	it('should exist', () => {
		expect(typeof Observable).toBe('function');
	});

	describe('lift map()', () => {
		it('should change the output value', done => {
			var observable = new Observable(generator => {
				generator.next(42);
				generator.return();
			});

			observable.map(x => x + 1).observer({
				next: x => {
					expect(x).toBe(43);
					done();
				}
			});
		});
	});


	describe('observer-observable pair map2()', () => {
		it('should change the output value', done => {
			var observable = new Observable(generator => {
				generator.next(42);
				generator.return();
			});

			observable.map2(x => x + 1).observer({
				next: x => {
					expect(x).toBe(43);
					done();
				}
			});
		});
	});

	describe('lift flatMap()', () => {
		it('should flatten return observables', done => {
			var observable = new Observable(generator => {
				generator.next(new Observable(gen2 => {
					gen2.next(42);
					gen2.return();
				}));
				generator.return();
			});

			observable.flatMap(x => x).observer({
				next: x => {
					expect(x).toBe(42);
					done();
				}
			});
		});
	});

	describe('observer-observable pair flatMap2()', () => {
		it('should flatten return observables', done => {
			var observable = new Observable(generator => {
				generator.next(new Observable(gen2 => {
					gen2.next(42);
					gen2.return();
				}));
				generator.return();
			});

			observable.flatMap2(x => x).observer({
				next: x => {
					expect(x).toBe(42);
					done();
				}
			});
		});
	});

	describe('Observable.return(value)', () => {
		it('should return an observable of just that value', done => {
			var observable = Observable.return(42);
			var calls = 0;

			observable.observer({
				next(x) {
					expect(x).toBe(42);
					expect(++calls).toBe(1);
				},

				return() {
					done();
				}
			});
		});
	})
});