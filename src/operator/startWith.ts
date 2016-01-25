import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/ArrayObservable';
import {ScalarObservable} from '../observable/ScalarObservable';
import {EmptyObservable} from '../observable/EmptyObservable';
import {concatStatic} from './concat';
import {isScheduler} from '../util/isScheduler';

/**
 * Returns an Observable that emits the items in a specified Iterable before it begins to emit items emitted by the
 * source Observable.
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {Values} an Iterable that contains the items you want the modified Observable to emit first.
 * @returns {Observable} an Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 */
export function startWith<T>(...array: Array<T | Scheduler>): Observable<T> {
  let scheduler = <Scheduler>array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
  } else {
    scheduler = null;
  }

  const len = array.length;
  if (len === 1) {
    return concatStatic(new ScalarObservable<T>(<T>array[0], scheduler), <Observable<T>>this);
  } else if (len > 1) {
    return concatStatic(new ArrayObservable<T>(<T[]>array, scheduler), <Observable<T>>this);
  } else {
    return concatStatic(new EmptyObservable<T>(scheduler), <Observable<T>>this);
  }
}
