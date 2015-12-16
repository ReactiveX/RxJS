import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {asap} from '../scheduler/asap';

export function debounceTime<T>(dueTime: number, scheduler: Scheduler = asap): Observable<T> {
  return this.lift(new DebounceTimeOperator(dueTime, scheduler));
}

class DebounceTimeOperator<T, R> implements Operator<T, R> {
  constructor(private dueTime: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler);
  }
}

class DebounceTimeSubscriber<T> extends Subscriber<T> {
  private debouncedSubscription: Subscription = null;
  private lastValue: T = null;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<T>,
              private dueTime: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  _next(value: T) {
    this.clearDebounce();
    this.lastValue = value;
    this.hasValue = true;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  }

  _complete() {
    this.debouncedNext();
    this.destination.complete();
  }

  debouncedNext(): void {
    this.clearDebounce();

    if (this.hasValue) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
      this.hasValue = false;
    }
  }

  private clearDebounce(): void {
    const debouncedSubscription = this.debouncedSubscription;

    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  }
}

function dispatchNext(subscriber) {
  subscriber.debouncedNext();
}
