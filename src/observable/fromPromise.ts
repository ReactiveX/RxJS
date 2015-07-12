import Observable from '../Observable';
import Observer from '../Observer';
import $$observer from '../util/Symbol_observer';

class PromiseObservable extends Observable {
  promise: Promise<any>;
  
  constructor(promise: Promise<any>) {
    super(null);
    this.promise = promise; 
  }
  
  [$$observer](observer:Observer) {
    var promise = this.promise;
    if(promise) {
      promise.then(x => {
        if(!observer.unsubscribed) {
          observer.next(x);
          observer.complete();
        }
      }, e => {
        if(!observer.unsubscribed) {
          observer.throw(e);
        }
      });
    }
  }
}

export default function fromPromise(promise: Promise<any>) : Observable {
  return new PromiseObservable(promise);
}
