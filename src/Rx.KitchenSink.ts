import {Observable} from './Observable';
import {CoreOperators} from './CoreOperators';
import {Scheduler as IScheduler} from './Scheduler';

export interface KitchenSinkOperators<T> extends CoreOperators<T> {
  isEmpty?: () => Observable<boolean>;
  elementAt?: (index: number, defaultValue?: any) => Observable<T>;
  distinctUntilKeyChanged?: (key: string, compare?: (x: any, y: any) => boolean, thisArg?: any) => Observable<T>;
  find?: (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<T>;
  findIndex?: (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<number>;
  max?: <T, R>(comparer?: (x: R, y: T) => R) => Observable<R>;
  min?: <T, R>(comparer?: (x: R, y: T) => R) => Observable<R>;
  timeInterval?: <T>(scheduler?: IScheduler) => Observable<T>;
  mergeScan?: <T, R>(project: (acc: R, x: T) => Observable<R>, seed: R) => Observable<R>;
  switchFirst?: () => Observable<T>;
  switchMapFirst?: <R>(project: ((x: T, ix: number) => Observable<any>),
                       projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
}

// statics
/* tslint:disable:no-use-before-declare */
import './operators/combineLatest-static';
import './operators/concat-static';
import './operators/merge-static';
import './observables/DeferObservable';
import './observables/EmptyObservable';
import './observables/ForkJoinObservable';
import './observables/FromObservable';
import './observables/ArrayObservable';
import './observables/FromEventObservable';
import './observables/FromEventPatternObservable';
import './observables/PromiseObservable';
import './observables/CallbackObservable';
import './observables/IntervalObservable';
import './observables/InfiniteObservable';
import './observables/RangeObservable';
import './observables/ErrorObservable';
import './observables/TimerObservable';
import './operators/zip-static';

// Operators
import './operators/buffer';
import './operators/bufferCount';
import './operators/bufferTime';
import './operators/bufferToggle';
import './operators/bufferWhen';
import './operators/catch';
import './operators/combineAll';
import './operators/combineLatest';
import './operators/concat';
import './operators/concatAll';
import './operators/concatMap';
import './operators/concatMapTo';
import './operators/count';
import './operators/dematerialize';
import './operators/debounce';
import './operators/debounceTime';
import './operators/defaultIfEmpty';
import './operators/delay';
import './operators/distinctUntilChanged';
import './operators/extended/distinctUntilKeyChanged';
import './operators/do';
import './operators/extended/elementAt';
import './operators/expand';
import './operators/filter';
import './operators/extended/find';
import './operators/extended/findIndex';
import './operators/finally';
import './operators/first';
import './operators/groupBy';
import './operators/ignoreElements';
import './operators/extended/isEmpty';
import './operators/every';
import './operators/last';
import './operators/map';
import './operators/mapTo';
import './operators/materialize';
import './operators/extended/max';
import './operators/merge';
import './operators/mergeAll';
import './operators/mergeMap';
import './operators/mergeMapTo';
import './operators/extended/mergeScan';
import './operators/extended/min';
import './operators/multicast';
import './operators/observeOn';
import './operators/partition';
import './operators/publish';
import './operators/publishBehavior';
import './operators/publishReplay';
import './operators/reduce';
import './operators/repeat';
import './operators/retry';
import './operators/retryWhen';
import './operators/sample';
import './operators/sampleTime';
import './operators/scan';
import './operators/share';
import './operators/single';
import './operators/skip';
import './operators/skipUntil';
import './operators/skipWhile';
import './operators/startWith';
import './operators/subscribeOn';
import './operators/switch';
import './operators/switchMap';
import './operators/switchMapTo';
import './operators/take';
import './operators/takeUntil';
import './operators/takeWhile';
import './operators/throttle';
import './operators/throttleTime';
import './operators/extended/timeInterval';
import './operators/timeout';
import './operators/timeoutWith';
import './operators/toArray';
import './operators/toPromise';
import './operators/window';
import './operators/windowCount';
import './operators/windowTime';
import './operators/windowToggle';
import './operators/windowWhen';
import './operators/withLatestFrom';
import './operators/zip';
import './operators/zipAll';

/* tslint:disable:no-unused-variable */
import {Subject} from './Subject';
import {Subscription} from './Subscription';
import {Subscriber} from './Subscriber';
import {ReplaySubject} from './subjects/ReplaySubject';
import {BehaviorSubject} from './subjects/BehaviorSubject';
import {ConnectableObservable} from './observables/ConnectableObservable';
import {Notification} from './Notification';
import {EmptyError} from './util/EmptyError';
import {ArgumentOutOfRangeError} from './util/ArgumentOutOfRangeError';
import {nextTick} from './schedulers/nextTick';
import {immediate} from './schedulers/immediate';
import {NextTickScheduler} from './schedulers/NextTickScheduler';
import {ImmediateScheduler} from './schedulers/ImmediateScheduler';
import {TimeInterval} from './operators/extended/timeInterval';
import {TestScheduler} from './testing/TestScheduler';
import {VirtualTimeScheduler} from './schedulers/VirtualTimeScheduler';
/* tslint:enable:no-unused-variable */

/* tslint:disable:no-var-keyword */
var Scheduler = {
  nextTick,
  immediate
};
/* tslint:enable:no-var-keyword */

export {
    Subject,
    Scheduler,
    Observable,
    Subscriber,
    Subscription,
    ReplaySubject,
    BehaviorSubject,
    ConnectableObservable,
    Notification,
    EmptyError,
    ArgumentOutOfRangeError,
    TestScheduler,
    VirtualTimeScheduler,
    TimeInterval
};
