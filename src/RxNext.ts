import OperatorObservable from './OperatorObservable';
import Observable from './Observable';
import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import CompositeSubscription from './CompositeSubscription';
import SerialSubscription from './SerialSubscription';


import value from './observable/value';

import select from './operator/select';
import mergeAll from './operator/mergeAll';
import selectMany from './operator/selectMany';

OperatorObservable.value = value;
OperatorObservable.return = value;

OperatorObservable.prototype.select = select;
OperatorObservable.prototype.map = select;
OperatorObservable.prototype.mergeAll = mergeAll;
OperatorObservable.prototype.selectMany = selectMany;
OperatorObservable.prototype.flatMap = selectMany;

var RxNext = {
  Observable,
  Scheduler,
  Observer,
  OperatorObservable,
  Subscription,
  CompositeSubscription,
  SerialSubscription
};

export default RxNext;