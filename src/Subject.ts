import {Operator} from './Operator';
import {Observer} from './Observer';
import {Observable, IObservable} from './Observable';
import {ISubscriber, Subscriber} from './Subscriber';
import {ISimpleSubscription, ISubscription, Subscription} from './Subscription';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';
import {SubjectSubscription} from './SubjectSubscription';
import {$$rxSubscriber} from './symbol/rxSubscriber';

/**
 * @class SubjectSubscriber<T>
 */
export class SubjectSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Subject<T>) {
    super(destination);
  }
}

export interface ISubject<T> extends IObservable<T> { }
export interface Subject<T> extends ISubject<T> { }

/**
 * @class Subject<T>
 */
export class Subject<T> extends Observable<T> implements ISimpleSubscription {

  [$$rxSubscriber]() {
    return new SubjectSubscriber(this);
  }

  observers: Observer<T>[] = [];

  closed = false;

  isStopped = false;

  hasError = false;

  thrownError: any = null;

  constructor() {
    super();
  }

  static create: Function = <T>(destination: Observer<T>, source: IObservable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  };

  lift<T, R>(operator: Operator<T, R>): IObservable<T> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return <any>subject;
  }

  next(value?: T) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  }

  error(err: any) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  }

  complete() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  }

  unsubscribe() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  }

  protected _subscribe(subscriber: ISubscriber<T>): ISubscription {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this.isStopped) {
      subscriber.complete();
      return Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      return new SubjectSubscription(this, subscriber);
    }
  }

  asObservable(): IObservable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this;
    return observable;
  }
}

/**
 * @class AnonymousSubject<T>
 */
export class AnonymousSubject<T> extends Subject<T> {
  constructor(protected destination?: Observer<T>, source?: IObservable<T>) {
    super();
    this.source = source;
  }

  next(value: T) {
    const { destination } = this;
    if (destination && destination.next) {
      destination.next(value);
    }
  }

  error(err: any) {
    const { destination } = this;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  }

  complete() {
    const { destination } = this;
    if (destination && destination.complete) {
      this.destination.complete();
    }
  }

  protected _subscribe(subscriber: ISubscriber<T>): ISubscription {
    const { source } = this;
    if (source) {
      return this.source.subscribe(subscriber);
    } else {
      return Subscription.EMPTY;
    }
  }
}
