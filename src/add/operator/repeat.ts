
import {Observable} from '../../Observable';
import {repeat} from '../../operator/repeat';

Observable.prototype.repeat = repeat;

declare module '../../Observable' {
  interface Observable<T> {
    repeat: (count?: number) => Observable<T>;
  }
}

export var _void: void;