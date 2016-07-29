import {Observable, IObservable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ReplaySubject} from '../ReplaySubject';
import {Observer} from '../Observer';
import {ISubscription, Subscription} from '../Subscription';

/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {Observable<any>}
 * @method cache
 * @owner Observable
 */
export function cache<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                         windowTime: number = Number.POSITIVE_INFINITY,
                         scheduler?: Scheduler): IObservable<T> {
  let subject: ReplaySubject<T>;
  let source = this;
  let refs = 0;
  let outerSub: ISubscription;

  const getSubject = () => {
    subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler);
    return subject;
  };

  return new Observable<T>((observer: Observer<T>) => {
    if (!subject) {
      subject = getSubject();
      outerSub = source.subscribe(
        (value: T) => subject.next(value),
        (err: any) => {
          let s = subject;
          subject = null;
          s.error(err);
        },
        () => subject.complete()
      );
    }

    refs++;

    if (!subject) {
      subject = getSubject();
    }
    let innerSub = subject.subscribe(observer);

    return () => {
      refs--;
      if (innerSub) {
        innerSub.unsubscribe();
      }
      if (refs === 0) {
        outerSub.unsubscribe();
      }
    };
  });
}

export interface CacheSignature<T> {
  (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): IObservable<T>;
}
