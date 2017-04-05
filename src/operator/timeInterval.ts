import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { async } from '../scheduler/async';

export interface ITimeInterval<T> {
  value: T;
  interval: number;
}

/**
 * @param scheduler
 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timeInterval
 * @owner Observable
 */
export function timeInterval<T>(this: Observable<T>, scheduler: IScheduler = async): Observable<ITimeInterval<T>> {
  return this.lift(new TimeIntervalOperator(scheduler));
}

export class TimeInterval<T> implements ITimeInterval<T> {
  constructor(public value: T, public interval: number) {

  }
};

class TimeIntervalOperator<T> implements Operator<T, TimeInterval<T>> {
  constructor(private scheduler: IScheduler) {

  }

  call(observer: Subscriber<TimeInterval<T>>, source: any): any {
    return source.subscribe(new TimeIntervalSubscriber(observer, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TimeIntervalSubscriber<T> extends Subscriber<T> {
  private lastTime: number = 0;

  constructor(destination: Subscriber<TimeInterval<T>>, private scheduler: IScheduler) {
    super(destination);

    this.lastTime = scheduler.now();
  }

  protected _next(value: T) {
    let now = this.scheduler.now();
    let span = now - this.lastTime;
    this.lastTime = now;

    this.destination.next(new TimeInterval(value, span));
  }
}
