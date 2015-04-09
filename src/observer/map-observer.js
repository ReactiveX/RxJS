import Observer from './observer';

export default class MapObserver extends Observer {
  constructor(projection, generator, subscriptionRef) {
    super(generator, subscriptionRef);
    this._projection = projection;
  }

	next(value){
    return Observer.prototype.next.call(this, this._projection(value));
  }
}
