import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {nextTick} from '../schedulers/nextTick';

export function throttleTime<T>(delay: number, scheduler: Scheduler = nextTick) {
  return this.lift(new ThrottleTimeOperator(delay, scheduler));
}

class ThrottleTimeOperator<T, R> implements Operator<T, R> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ThrottleTimeSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription<any>;

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  _next(value: T) {
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, { subscriber: this }));
      this.destination.next(value);
    }
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  }
}

function dispatchNext<T>({ subscriber }) {
  subscriber.clearThrottle();
}

Observable.prototype.throttleTime = throttleTime;
