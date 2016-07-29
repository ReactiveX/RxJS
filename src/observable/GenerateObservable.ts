import {Scheduler} from '../Scheduler';
import {Action} from '../scheduler/Action';
import {Observable, IObservable} from '../Observable' ;
import {ISubscriber, Subscriber} from '../Subscriber';
import {ISubscription, Subscription} from '../Subscription';
import {isScheduler} from '../util/isScheduler';

const selfSelector = <T>(value: T) => value;

export type ConditionFunc<S> = (state: S) => boolean;
export type IterateFunc<S> = (state: S) => S;
export type ResultFunc<S, T> = (state: S) => T;

interface SchedulerState<T, S> {
  needIterate?: boolean;
  state: S;
  subscriber: ISubscriber<T>;
  condition?: ConditionFunc<S>;
  iterate: IterateFunc<S>;
  resultSelector: ResultFunc<S, T>;
}

export interface GenerateBaseOptions<S> {
  /**
   * Inital state.
  */
  initialState: S;
  /**
   * Condition function that accepts state and returns boolean.
   * When it returns false, the generator stops.
   * If not specified, a generator never stops.
  */
  condition?: ConditionFunc<S>;
  /**
   * Iterate function that accepts state and returns new state.
   */
  iterate: IterateFunc<S>;
  /**
   * Scheduler to use for generation process.
   * By default, a generator starts immediately.
  */
  scheduler?: Scheduler;
}

export interface GenerateOptions<T, S> extends GenerateBaseOptions<S> {
  /**
   * Result selection function that accepts state and returns a value to emit.
   */
  resultSelector: ResultFunc<S, T>;
}

export interface IGenerateObservable<T> extends IObservable<T> { }
export interface GenerateObservable<T> extends IGenerateObservable<T> { }

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class GenerateObservable<T, S> extends Observable<T> {
  constructor(private initialState: S,
              private condition: ConditionFunc<S>,
              private iterate: IterateFunc<S>,
              private resultSelector: ResultFunc<S, T>,
              private scheduler?: Scheduler) {
      super();
  }

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   *
   * <img src="./img/generate.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
   * var res = Rx.Observable.generate(0, x => x < 10, x => x + 1, x => x);
   *
   * @example <caption>Using asap scheduler, produces sequence of 2, 3, 5, then completes.</caption>
   * var res = Rx.Observable.generate(1, x => x < 5, x => x * 2, x => x + 1, Rx.Scheduler.asap);
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {S} initialState Initial state.
   * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
   * @param {function (state: S): S} iterate Iteration step function.
   * @param {function (state: S): T} resultSelector Selector function for results produced in the sequence.
   * @param {Scheduler} [scheduler] A {@link Scheduler} on which to run the generator loop. If not provided, defaults to emit immediately.
   * @returns {Observable<T>} The generated sequence.
   */
  static create<T, S>(initialState: S,
                      condition: ConditionFunc<S>,
                      iterate: IterateFunc<S>,
                      resultSelector: ResultFunc<S, T>,
                      scheduler?: Scheduler): IObservable<T>

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   * The overload uses state as an emitted value.
   *
   * <img src="./img/generate.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
   * var res = Rx.Observable.generate(0, x => x < 10, x => x + 1);
   *
   * @example <caption>Using asap scheduler, produces sequence of 1, 2, 4, then completes.</caption>
   * var res = Rx.Observable.generate(1, x => x < 5, x => x * 2, Rx.Scheduler.asap);
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {S} initialState Initial state.
   * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
   * @param {function (state: S): S} iterate Iteration step function.
   * @param {Scheduler} [scheduler] A {@link Scheduler} on which to run the generator loop. If not provided, defaults to emit immediately.
   * @returns {Observable<S>} The generated sequence.
   */
  static create<S>(initialState: S,
                   condition: ConditionFunc<S>,
                   iterate: IterateFunc<S>,
                   scheduler?: Scheduler): IObservable<S>

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   * The overload accepts options object that might contain inital state, iterate,
   * condition and scheduler.
   *
   * <img src="./img/generate.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
   * var res = Rx.Observable.generate({
   *   initialState: 0,
   *   condition: x => x < 10,
   *   iterate: x => x + 1
   * });
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {GenerateBaseOptions<S>} options Object that must contain initialState, iterate and might contain condition and scheduler.
   * @returns {Observable<S>} The generated sequence.
   */
  static create<S>(options: GenerateBaseOptions<S>): IObservable<S>

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   * The overload accepts options object that might contain inital state, iterate,
   * condition, result selector and scheduler.
   *
   * <img src="./img/generate.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
   * var res = Rx.Observable.generate({
   *   initialState: 0,
   *   condition: x => x < 10,
   *   iterate: x => x + 1,
   *   resultSelector: x => x
   * });
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {GenerateOptions<T, S>} options Object that must contain initialState, iterate, resultSelector and might contain condition and scheduler.
   * @returns {Observable<T>} The generated sequence.
   */
  static create<T, S>(options: GenerateOptions<T, S>): IObservable<T>

  static create<T, S>(initialStateOrOptions: S | GenerateOptions<T, S>,
                      condition?: ConditionFunc<S>,
                      iterate?: IterateFunc<S>,
                      resultSelectorOrObservable?: (ResultFunc<S, T>) | Scheduler,
                      scheduler?: Scheduler): IObservable<T> {
    if (arguments.length == 1) {
      return new GenerateObservable<T, S>(
        (<GenerateOptions<T, S>>initialStateOrOptions).initialState,
        (<GenerateOptions<T, S>>initialStateOrOptions).condition,
        (<GenerateOptions<T, S>>initialStateOrOptions).iterate,
        (<GenerateOptions<T, S>>initialStateOrOptions).resultSelector || selfSelector,
        (<GenerateOptions<T, S>>initialStateOrOptions).scheduler);
    }

    if (resultSelectorOrObservable === undefined || isScheduler(resultSelectorOrObservable)) {
      return new GenerateObservable<T, S>(
        <S>initialStateOrOptions,
        condition,
        iterate,
        selfSelector,
        <Scheduler>resultSelectorOrObservable);
    }

    return new GenerateObservable<T, S>(
      <S>initialStateOrOptions,
      condition,
      iterate,
      <ResultFunc<S, T>>resultSelectorOrObservable,
      <Scheduler>scheduler);
  }

  protected _subscribe(subscriber: ISubscriber<any>): ISubscription | Function | void {
    let state = this.initialState;
    if (this.scheduler) {
      return this.scheduler.schedule<SchedulerState<T, S>>(GenerateObservable.dispatch, 0, {
        subscriber,
        iterate: this.iterate,
        condition: this.condition,
        resultSelector: this.resultSelector,
        state });
    }
    const { condition, resultSelector, iterate } = this;
    do {
      if (condition) {
        let conditionResult: boolean;
        try {
          conditionResult = condition(state);
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (!conditionResult) {
          subscriber.complete();
          break;
        }
      }
      let value: T;
      try {
        value = resultSelector(state);
      } catch (err) {
        subscriber.error(err);
        return;
      }
      subscriber.next(value);
      if (subscriber.closed) {
        break;
      }
      try {
        state = iterate(state);
      } catch (err) {
        subscriber.error(err);
        return;
      }
    } while (true);
  }

  private static dispatch<T, S>(state: SchedulerState<T, S>): ISubscription | void {
    const { subscriber, condition } = state;
    if (subscriber.closed) {
      return;
    }
    if (state.needIterate) {
      try {
        state.state = state.iterate(state.state);
      } catch (err) {
        subscriber.error(err);
        return;
      }
    } else {
      state.needIterate = true;
    }
    if (condition) {
      let conditionResult: boolean;
      try {
        conditionResult = condition(state.state);
      } catch (err) {
        subscriber.error(err);
        return;
      }
      if (!conditionResult) {
        subscriber.complete();
        return;
      }
      if (subscriber.closed) {
        return;
      }
    }
    let value: T;
    try {
      value = state.resultSelector(state.state);
    } catch (err) {
      subscriber.error(err);
      return;
    }
    if (subscriber.closed) {
      return;
    }
    subscriber.next(value);
    if (subscriber.closed) {
      return;
    }
    return (<Action<SchedulerState<T, S>>><any>this).schedule(state);
  }
}
