import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subject} from '../Subject';
import {Map} from '../util/Map';
import {FastMap} from '../util/FastMap';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one `GroupedObservable` per group.
 *
 * <img src="./img/groupBy.png" width="100%">
 *
 * @param {Function} keySelector - a function that extracts the key for each item
 * @param {Function} elementSelector - a function that extracts the return element for each item
 * @returns {Observable} an Observable that emits GroupedObservables, each of which corresponds
 * to a unique key value and each of which emits those items from the source Observable that share
 * that key value.
 */
export function groupBy<T, K, R>(keySelector: (value: T) => K,
                                 elementSelector?: (value: T) => R,
                                 durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): Observable<GroupedObservable<K, R>> {
  return this.lift(new GroupByOperator(this, keySelector, elementSelector, durationSelector));
}

export interface RefCountSubscription {
  count: number;
  unsubscribe: () => void;
  isUnsubscribed: boolean;
  attemptedToUnsubscribe: boolean;
}

class GroupByOperator<T, K, R> extends Operator<T, R> {
  constructor(public source: Observable<T>,
              private keySelector: (value: T) => K,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>) {
    super();
  }

  call(subscriber: Subscriber<GroupedObservable<K, R>>): Subscriber<T> {
    return new GroupBySubscriber(
      subscriber, this.keySelector, this.elementSelector, this.durationSelector
    );
  }
}

class GroupBySubscriber<T, K, R> extends Subscriber<T> implements RefCountSubscription {
  private groups: Map<K, Subject<T|R>> = null;
  public attemptedToUnsubscribe: boolean = false;
  public count: number = 0;

  constructor(destination: Subscriber<GroupedObservable<K, R>>,
              private keySelector: (value: T) => K,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>) {
    super();
    this.destination = destination;
    this.add(destination);
  }

  protected _next(x: T): void {
    let key = tryCatch(this.keySelector)(x);
    if (key === errorObject) {
      this.error(errorObject.e);
    } else {
      let groups = this.groups;
      const elementSelector = this.elementSelector;
      const durationSelector = this.durationSelector;

      if (!groups) {
        groups = this.groups = typeof key === 'string' ? new FastMap() : new Map();
      }

      let group = groups.get(key);

      if (!group) {
        groups.set(key, group = new Subject<R>());
        let groupedObservable = new GroupedObservable(key, group, this);

        if (durationSelector) {
          let duration = tryCatch(durationSelector)(new GroupedObservable<K, R>(key, <any>group));
          if (duration === errorObject) {
            this.error(errorObject.e);
          } else {
            this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
          }
        }

        this.destination.next(groupedObservable);
      }

      if (elementSelector) {
        let value = tryCatch(elementSelector)(x);
        if (value === errorObject) {
          this.error(errorObject.e);
        } else {
          group.next(value);
        }
      } else {
        group.next(x);
      }
    }
  }

  protected _error(err: any): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.error(err);
        this.removeGroup(key);
      });
    }
    this.destination.error(err);
  }

  protected _complete(): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.complete();
        this.removeGroup(key);
      });
    }
    this.destination.complete();
  }

  removeGroup(key: K): void {
    this.groups.delete(key);
  }

  unsubscribe() {
    if (!this.isUnsubscribed && !this.attemptedToUnsubscribe) {
      this.attemptedToUnsubscribe = true;
      if (this.count === 0) {
        super.unsubscribe();
      }
    }
  }
}

class GroupDurationSubscriber<K, T> extends Subscriber<T> {
  constructor(private key: K,
              private group: Subject<T>,
              private parent: GroupBySubscriber<any, K, T>) {
    super();
  }

  protected _next(value: T): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }

  protected _error(err: any): void {
    this.group.error(err);
    this.parent.removeGroup(this.key);
  }

  protected _complete(): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }
}

export class GroupedObservable<K, T> extends Observable<T> {
  constructor(public key: K,
              private groupSubject: Subject<T>,
              private refCountSubscription?: RefCountSubscription) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const subscription = new Subscription();
    const {refCountSubscription, groupSubject} = this;
    if (refCountSubscription && !refCountSubscription.isUnsubscribed) {
      subscription.add(new InnerRefCountSubscription(refCountSubscription));
    }
    subscription.add(groupSubject.subscribe(subscriber));
    return subscription;
  }
}

class InnerRefCountSubscription extends Subscription {
  constructor(private parent: RefCountSubscription) {
    super();
    parent.count++;
  }

  unsubscribe() {
    const parent = this.parent;
    if (!parent.isUnsubscribed && !this.isUnsubscribed) {
      super.unsubscribe();
      parent.count -= 1;
      if (parent.count === 0 && parent.attemptedToUnsubscribe) {
        parent.unsubscribe();
      }
    }
  }
}
