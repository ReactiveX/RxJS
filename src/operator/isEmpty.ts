import {Operator} from '../Operator';
import {ISubscriber, Subscriber} from '../Subscriber';
import {IObservable} from '../Observable';

/**
 * If the source Observable is empty it returns an Observable that emits true, otherwise it emits false.
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @return {Observable} an Observable that emits a Boolean.
 * @method isEmpty
 * @owner Observable
 */
export function isEmpty(): IObservable<boolean> {
  return this.lift(new IsEmptyOperator());
}

export interface IsEmptySignature<T> {
  (): IObservable<boolean>;
}

class IsEmptyOperator implements Operator<any, boolean> {
  call (observer: ISubscriber<boolean>, source: any): any {
    return source._subscribe(new IsEmptySubscriber(observer));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class IsEmptySubscriber extends Subscriber<any> {
  constructor(destination: ISubscriber<boolean>) {
    super(destination);
  }

  private notifyComplete(isEmpty: boolean): void {
    const destination = this.destination;

    destination.next(isEmpty);
    destination.complete();
  }

  protected _next(value: boolean) {
    this.notifyComplete(false);
  }

  protected _complete() {
    this.notifyComplete(true);
  }
}
