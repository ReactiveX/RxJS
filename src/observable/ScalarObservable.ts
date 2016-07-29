import {Scheduler} from '../Scheduler';
import {Observable, IObservable} from '../Observable';
import {ISubscriber, Subscriber} from '../Subscriber';
import {TeardownLogic} from '../Subscription';

export interface IScalarObservable<T> extends IObservable<T> { }
export interface ScalarObservable<T> extends IScalarObservable<T> { }

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ScalarObservable<T> extends Observable<T> {
  static create<T>(value: T, scheduler?: Scheduler): ScalarObservable<T> {
    return new ScalarObservable(value, scheduler);
  }

  static dispatch(state: any): void {
    const { done, value, subscriber } = state;

    if (done) {
      subscriber.complete();
      return;
    }

    subscriber.next(value);
    if (subscriber.closed) {
      return;
    }

    state.done = true;
    (<any> this).schedule(state);
  }

  _isScalar: boolean = true;

  constructor(public value: T, private scheduler?: Scheduler) {
    super();
    if (scheduler) {
      this._isScalar = false;
    }
  }

  protected _subscribe(subscriber: ISubscriber<T>): TeardownLogic {
    const value = this.value;
    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(ScalarObservable.dispatch, 0, {
        done: false, value, subscriber
      });
    } else {
      subscriber.next(value);
      if (!subscriber.closed) {
        subscriber.complete();
      }
    }
  }
}
