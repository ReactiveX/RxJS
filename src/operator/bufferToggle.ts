import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable, SubscribableOrPromise} from '../Observable';
import {Subscription} from '../Subscription';

import {subscribeToResult} from '../util/subscribeToResult';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';

/**
 * Buffers the source Observable values starting from an emission from
 * `openings` and ending when the output of `closingSelector` emits.
 *
 * <span class="informal">Collects values from the past as an array. Starts
 * collecting only when `opening` emits, and calls the `closingSelector`
 * function to get an Observable that tells when to close the buffer.</span>
 *
 * <img src="./img/bufferToggle.png" width="100%">
 *
 * Buffers values from the source by opening the buffer via signals from an
 * Observable provided to `openings`, and closing and sending the buffers when
 * a Subscribable or Promise returned by the `closingSelector` function emits.
 *
 * @example <caption>Every other second, emit the click events from the next 500ms</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var openings = Rx.Observable.interval(1000);
 * var buffered = clicks.bufferToggle(openings, i =>
 *   i % 2 ? Rx.Observable.interval(500) : Rx.Observable.empty()
 * );
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferWhen}
 * @see {@link windowToggle}
 *
 * @param {Observable<O>} openings An observable of notifications to start new
 * buffers.
 * @param {function(value: O): Observable} closingSelector A function that takes
 * the value emitted by the `openings` observable and returns a Subscribable or Promise,
 * which, when it emits, signals that the associated buffer should be emitted
 * and cleared.
 * @return {Observable<T[]>} An observable of arrays of buffered values.
 * @method bufferToggle
 * @owner Observable
 */
export function bufferToggle<T, O>(openings: Observable<O>,
                                   closingSelector: (value: O) => SubscribableOrPromise<any> | void): Observable<T[]> {
  return this.lift(new BufferToggleOperator<T, O>(openings, closingSelector));
}

export interface BufferToggleSignature<T> {
  <O>(openings: Observable<O>, closingSelector: (value: O) => SubscribableOrPromise<any> | void): Observable<T[]>;
}

class BufferToggleOperator<T, O> implements Operator<T, T[]> {

  constructor(private openings: Observable<O>,
              private closingSelector: (value: O) => SubscribableOrPromise<any> | void) {
  }

  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector);
  }
}

interface BufferContext<T> {
  buffer: T[];
  subscription: Subscription;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferToggleSubscriber<T, O> extends OuterSubscriber<T, O> {
  private contexts: Array<BufferContext<T>> = [];

  constructor(destination: Subscriber<T[]>,
              private openings: Observable<O>,
              private closingSelector: (value: O) => SubscribableOrPromise<any> | void) {
    super(destination);
    this.add(this.openings.subscribe(new BufferToggleOpeningsSubscriber(this)));
  }

  protected _next(value: T): void {
    const contexts = this.contexts;
    const len = contexts.length;
    for (let i = 0; i < len; i++) {
      contexts[i].buffer.push(value);
    }
  }

  protected _error(err: any): void {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      context.subscription.unsubscribe();
      context.buffer = null;
      context.subscription = null;
    }
    this.contexts = null;
    super._error(err);
  }

  protected _complete(): void {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      this.destination.next(context.buffer);
      context.subscription.unsubscribe();
      context.buffer = null;
      context.subscription = null;
    }
    this.contexts = null;
    super._complete();
  }

  openBuffer(value: O): void {
    try {
      const closingSelector = this.closingSelector;
      const closingNotifier = closingSelector.call(this, value);
      if (closingNotifier) {
        this.trySubscribe(closingNotifier);
      }
    } catch (err) {
      this._error(err);
    }
  }

  notifyNext(outerValue: any, innerValue: O,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, O>): void {
    this.closeBuffer(outerValue);
  }

  notifyComplete(innerSub: InnerSubscriber<T, O>): void {
    this.closeBuffer((<any> innerSub).context);
  }

  private closeBuffer(context: BufferContext<T>): void {
    const contexts = this.contexts;
    if (contexts === null) {
      return;
    }
    const { buffer, subscription } = context;
    this.destination.next(buffer);
    contexts.splice(contexts.indexOf(context), 1);
    this.remove(subscription);
    subscription.unsubscribe();
  }

  private trySubscribe(closingNotifier: any): void {
    const contexts = this.contexts;

    const buffer: Array<T> = [];
    const subscription = new Subscription();
    const context = { buffer, subscription };
    contexts.push(context);

    const innerSubscription = subscribeToResult(this, closingNotifier, <any>context);
    (<any> innerSubscription).context = context;

    this.add(innerSubscription);
    subscription.add(innerSubscription);
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferToggleOpeningsSubscriber<T, O> extends Subscriber<O> {
  constructor(private parent: BufferToggleSubscriber<T, O>) {
    super(null);
  }

  protected _next(value: O) {
    this.parent.openBuffer(value);
  }

  protected _error(err: any) {
    this.parent.error(err);
  }

  protected _complete() {
    // noop
  }
}
