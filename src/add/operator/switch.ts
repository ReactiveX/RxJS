
import {Observable} from '../../Observable';
import {_switch} from '../../operator/switch';

Observable.prototype.switch = _switch;

declare module '../../Observable' {
  interface Observable<T> {
    switch: <R>() => Observable<R>;
  }
}

export var _void: void;