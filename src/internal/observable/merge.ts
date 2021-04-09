import { Observable } from '../Observable';
import { ObservableInput, ObservableInputTuple, SchedulerLike } from '../types';
import { mergeAll } from '../operators/mergeAll';
import { internalFromArray } from './fromArray';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { innerFrom } from './from';
import { EMPTY } from './empty';
import { popNumber, popScheduler } from '../util/args';

export function merge<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A[number]>;
export function merge<A extends readonly unknown[]>(...sourcesAndConcurrency: [...ObservableInputTuple<A>, number?]): Observable<A[number]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and mergeAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function merge<A extends readonly unknown[]>(
  ...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike?]
): Observable<A[number]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and mergeAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function merge<A extends readonly unknown[]>(
  ...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>, number?, SchedulerLike?]
): Observable<A[number]>;

/**
 * Creates an output Observable which concurrently emits all values from every
 * given input Observable.
 *
 * <span class="informal">Flattens multiple Observables together by blending
 * their values into one Observable.</span>
 *
 * ![](merge.png)
 *
 * `merge` subscribes to each given input Observable (as arguments), and simply
 * forwards (without doing any transformation) all the values from all the input
 * Observables to the output Observable. The output Observable only completes
 * once all input Observables have completed. Any error delivered by an input
 * Observable will be immediately emitted on the output Observable.
 *
 * ## Examples
 * ### Merge together two Observables: 1s interval and clicks
 * ```ts
 * import { merge, fromEvent, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const clicksOrTimer = merge(clicks, timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // timer will emit ascending values, one every second(1000ms) to console
 * // clicks logs MouseEvents to console everytime the "document" is clicked
 * // Since the two streams are merged you see these happening
 * // as they occur.
 * ```
 *
 * ### Merge together 3 Observables, but only 2 run concurrently
 * ```ts
 * import { merge, interval } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * const timer1 = interval(1000).pipe(take(10));
 * const timer2 = interval(2000).pipe(take(6));
 * const timer3 = interval(500).pipe(take(10));
 * const concurrent = 2; // the argument
 * const merged = merge(timer1, timer2, timer3, concurrent);
 * merged.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - First timer1 and timer2 will run concurrently
 * // - timer1 will emit a value every 1000ms for 10 iterations
 * // - timer2 will emit a value every 2000ms for 6 iterations
 * // - after timer1 hits its max iteration, timer2 will
 * //   continue, and timer3 will start to run concurrently with timer2
 * // - when timer2 hits its max iteration it terminates, and
 * //   timer3 will continue to emit a value every 500ms until it is complete
 * ```
 *
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 *
 * @param {...ObservableInput} observables Input Observables to merge together.
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for managing
 * concurrency of input Observables.
 * @return {Observable} an Observable that emits items that are the result of
 * every input Observable.
 */
export function merge(...args: (ObservableInput<unknown> | number | SchedulerLike)[]): Observable<unknown> {
  const scheduler = popScheduler(args);
  const concurrent = popNumber(args, Infinity);
  const sources = argsOrArgArray(args) as ObservableInput<unknown>[];
  return !sources.length
    ? // No source provided
      EMPTY
    : sources.length === 1
    ? // One source? Just return it.
      innerFrom(sources[0])
    : // Merge all sources
      mergeAll(concurrent)(internalFromArray(sources, scheduler));
}
