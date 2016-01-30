
import {Observable} from '../../Observable';
import {ConnectableObservable} from '../../observable/ConnectableObservable';
import {publishBehavior} from '../../operator/publishBehavior';

Observable.prototype.publishBehavior = publishBehavior;

declare module '../../Observable' {
  interface Observable<T> {
    publishBehavior: (value: any) => ConnectableObservable<T>;
  }
}

export var _void: void;