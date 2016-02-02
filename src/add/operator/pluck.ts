
import {Observable} from '../../Observable';
import {pluck} from '../../operator/pluck';

Observable.prototype.pluck = pluck;

declare module '../../Observable' {
  interface Observable<T> {
    pluck: (...properties: string[]) => Observable<any>;
  }
}

export var _void: void;