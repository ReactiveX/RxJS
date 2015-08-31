import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function bufferToggle<T, O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>) : Observable<T[]> {
  return this.lift(new BufferToggleOperator<T, T, O>(openings, closingSelector));
}

export class BufferToggleOperator<T, R, O> implements Operator<T, R> {

  constructor(private openings: Observable<O>, private closingSelector: (openValue: O) => Observable<any>) {
  }

  call(observer: Observer<T>): Observer<T> {
    return new BufferToggleSubscriber<T, O>(observer, this.openings, this.closingSelector);
  }
}

export class BufferToggleSubscriber<T, O> extends Subscriber<T> {
  private buffers: Array<T[]> = [];
  private closingNotification: Subscription<any>;
  
  constructor(destination: Observer<T>, private openings: Observable<O>, private closingSelector: (openValue: O) => Observable<any>) {
    super(destination);
    this.add(this.openings.subscribe(new BufferToggleOpeningsSubscriber(this)));
  }

  _next(value: T) {
    const buffers = this.buffers;
    const len = buffers.length;
    for (let i = 0; i < len; i++) {
      buffers[i].push(value);
    }
  }
  
  _error(err: any) {
    this.buffers = null;
    this.destination.error(err);
  }
  
  _complete() {
    const buffers = this.buffers;
    while (buffers.length > 0) {
      this.destination.next(buffers.shift());
    }
    this.destination.complete();
  }
  
  openBuffer(value: O) {
    const closingSelector = this.closingSelector;
    const buffers = this.buffers;
    
    let closingNotifier = tryCatch(closingSelector)(value);
    if (closingNotifier === errorObject) {
      const err = closingNotifier.e;
      this.buffers = null;
      this.destination.error(err);
    } else {
      let buffer = [];
      let context = {
        buffer,
        subscription: null
      };
      buffers.push(buffer);
      this.add(context.subscription = closingNotifier.subscribe(new BufferClosingNotifierSubscriber(this, context)));
    }
  }
  
  closeBuffer(context: { subscription: any, buffer: T[] }) {
    const { buffer, subscription } = context;
    const buffers = this.buffers;
    this.destination.next(buffer);
    buffers.splice(buffers.indexOf(buffer), 1);
    this.remove(subscription);
    subscription.unsubscribe();
  }
}

export class BufferClosingNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: BufferToggleSubscriber<any, T>, private context: { subscription: any, buffer: T[] }) {
    super(null);
  }
  
  _next() {
    this.parent.closeBuffer(this.context);
  }
  
  _error(err) {
    this.parent.error(err);
  }
  
  _complete() {
    // noop
  }
}

export class BufferToggleOpeningsSubscriber<T> extends Subscriber<T> {
  constructor(private parent: BufferToggleSubscriber<any, T>) {
    super(null);
  }
  
  _next(value: T) {
    this.parent.openBuffer(value);
  }
  
  _error(err) {
    this.parent.error(err);
  }
  
  _complete() {
    // noop
  }
}