
import { Observable } from '../../Observable';
import { mapTo } from '../../internal/patching/operator/mapTo';

Observable.prototype.mapTo = mapTo;

declare module '../../Observable' {
  interface Observable<T> {
    mapTo: typeof mapTo;
  }
}
