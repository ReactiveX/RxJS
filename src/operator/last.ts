import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {EmptyError} from '../util/EmptyError';

/**
 * Returns an Observable that emits only the last item emitted by the source Observable.
 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
 * the last item from the source Observable, the resulting Observable will emit the last item
 * from the source Observable that satisfies the predicate.
 *
 * <img src="./img/last.png" width="100%">
 *
 * @param {function} predicate - the condition any source emitted item has to satisfy.
 * @returns {Observable} an Observable that emits only the last item satisfying the given condition
 * from the source, or an NoSuchElementException if no such items are emitted.
 * @throws - Throws if no items that match the predicate are emitted by the source Observable.
 */
export function last<T, R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                           resultSelector?: (value: T, index: number) => R,
                           defaultValue?: R): Observable<T> | Observable<R> {
  return this.lift(new LastOperator(predicate, resultSelector, defaultValue, this));
}

class LastOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: (value: T, index: number) => R,
              private defaultValue?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<R>): Subscriber<T> {
    return new LastSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source);
  }
}

class LastSubscriber<T, R> extends Subscriber<T> {
  private lastValue: T | R;
  private hasValue: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: (value: T, index: number) => R,
              private defaultValue?: any,
              private source?: Observable<T>) {
    super(destination);
    if (typeof defaultValue !== 'undefined') {
      this.lastValue = defaultValue;
      this.hasValue = true;
    }
  }

  protected _next(value: T): void {
    const { predicate, resultSelector, destination } = this;
    const index = this.index++;

    if (predicate) {
      let found = tryCatch(predicate)(value, index, this.source);
      if (found === errorObject) {
        destination.error(errorObject.e);
        return;
      }

      if (found) {
        if (resultSelector) {
          let result = tryCatch(resultSelector)(value, index);
          if (result === errorObject) {
            destination.error(errorObject.e);
            return;
          }
          this.lastValue = result;
        } else {
          this.lastValue = value;
        }
        this.hasValue = true;
      }
    } else {
      this.lastValue = value;
      this.hasValue = true;
    }
  }

  protected _complete(): void {
    const destination = this.destination;
    if (this.hasValue) {
      destination.next(this.lastValue);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}
