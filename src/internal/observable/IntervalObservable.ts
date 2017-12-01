import { Subscriber } from '../Subscriber';
import { isNumeric } from '../../util/isNumeric';
import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { async } from '../scheduler/async';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IntervalObservable extends Observable<number> {
  /**
   * Creates an Observable that emits sequential numbers every specified
   * interval of time, on a specified IScheduler.
   *
   * <span class="informal">Emits incremental numbers periodically in time.
   * </span>
   *
   * <img src="./img/interval.png" width="100%">
   *
   * `interval` returns an Observable that emits an infinite sequence of
   * ascending integers, with a constant interval of time of your choosing
   * between those emissions. The first emission is not sent immediately, but
   * only after the first period has passed. By default, this operator uses the
   * `async` IScheduler to provide a notion of time, but you may pass any
   * IScheduler to it.
   *
   * @example <caption>Emits ascending numbers, one every second (1000ms)</caption>
   * var numbers = Rx.Observable.interval(1000);
   * numbers.subscribe(x => console.log(x));
   *
   * @see {@link timer}
   * @see {@link delay}
   *
   * @param {number} [period=0] The interval size in milliseconds (by default)
   * or the time unit determined by the scheduler's clock.
   * @param {Scheduler} [scheduler=async] The IScheduler to use for scheduling
   * the emission of values, and providing a notion of "time".
   * @return {Observable} An Observable that emits a sequential number each time
   * interval.
   * @static true
   * @name interval
   * @owner Observable
   */
  static create(period: number = 0,
                scheduler: IScheduler = async): Observable<number> {
    return new IntervalObservable(period, scheduler);
  }

  static dispatch(state: any): void {
    const { index, subscriber, period } = state;

    subscriber.next(index);

    if (subscriber.closed) {
      return;
    }

    state.index += 1;

    (<any> this).schedule(state, period);
  }

  constructor(private period: number = 0,
              private scheduler: IScheduler = async) {
    super();
    if (!isNumeric(period) || period < 0) {
      this.period = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
      this.scheduler = async;
    }
  }

  protected _subscribe(subscriber: Subscriber<number>) {
    const index = 0;
    const period = this.period;
    const scheduler = this.scheduler;

    subscriber.add(scheduler.schedule(IntervalObservable.dispatch, period, {
      index, subscriber, period
    }));
  }
}
