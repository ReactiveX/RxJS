import {isNumeric} from '../util/isNumeric';
import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {asap} from '../scheduler/asap';
import {isScheduler} from '../util/isScheduler';
import {isDate} from '../util/isDate';
import {Subscription} from '../Subscription';

export class TimerObservable<T> extends Observable<T> {

  static create(dueTime: number | Date = 0, period?: number | Scheduler, scheduler?: Scheduler): Observable<number> {
    return new TimerObservable(dueTime, period, scheduler);
  }

  static dispatch(state) {

    const { index, period, subscriber } = state;
    const action = (<any> this);

    subscriber.next(index);

    if (subscriber.isUnsubscribed) {
      return;
    } else if (period === -1) {
      return subscriber.complete();
    }

    state.index = index + 1;
    action.schedule(state, period);
  }

  private period: number = -1;
  private dueTime: number = 0;
  private scheduler: Scheduler;

  constructor(dueTime: number | Date = 0,
              period?: number | Scheduler,
              scheduler?: Scheduler) {
    super();

    if (isNumeric(period)) {
      this.period = Number(period) < 1 && 1 || Number(period);
    } else if (isScheduler(period)) {
      scheduler = <Scheduler> period;
    }

    if (!isScheduler(scheduler)) {
      scheduler = asap;
    }

    this.scheduler = scheduler;
    this.dueTime = isDate(dueTime) ?
      (+dueTime - this.scheduler.now()) :
      (<number> dueTime);
  }

  _subscribe(subscriber): Subscription | Function | void {

    const index = 0;
    const { period, dueTime, scheduler } = this;

    return scheduler.schedule(TimerObservable.dispatch, dueTime, {
      index, period, subscriber
    });
  }
}
