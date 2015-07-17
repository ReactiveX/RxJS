(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilSymbol_observer = require('./util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _Subject2 = require('./Subject');

var _Subject3 = _interopRequireDefault(_Subject2);

var BehaviorSubject = (function (_Subject) {
    function BehaviorSubject(value) {
        _classCallCheck(this, BehaviorSubject);

        _Subject.call(this);
        this.value = value;
    }

    _inherits(BehaviorSubject, _Subject);

    BehaviorSubject.prototype[_utilSymbol_observer2['default']] = function (subscriber) {
        this.subscribers.push(subscriber);
        this.next(this.value);
        return subscriber;
    };

    BehaviorSubject.prototype.next = function next(value) {
        this.value = value;
        _Subject.prototype.next.call(this, value);
    };

    return BehaviorSubject;
})(_Subject3['default']);

exports['default'] = BehaviorSubject;
module.exports = exports['default'];
},{"./Subject":7,"./util/Symbol_observer":48}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilArraySlice = require('./util/arraySlice');

var _utilArraySlice2 = _interopRequireDefault(_utilArraySlice);

var CompositeSubscription = (function () {
    function CompositeSubscription() {
        _classCallCheck(this, CompositeSubscription);

        this.length = 0;
        this.isUnsubscribed = false;
    }

    CompositeSubscription.from = function from(subscriptions) {
        var comp = new CompositeSubscription();
        if (Array.isArray(subscriptions)) {
            subscriptions.forEach(function (sub) {
                return comp.add(sub);
            });
        }
        return comp;
    };

    CompositeSubscription.prototype.unsubscribe = function unsubscribe() {
        if (this.isUnsubscribed || !this.subscriptions) {
            return;
        }
        this.isUnsubscribed = true;
        var subscriptions = _utilArraySlice2['default'](this.subscriptions);
        var subscriptionCount = subscriptions && subscriptions.length || 0;
        var subscriptionIndex = -1;
        this.subscriptions = undefined;
        while (++subscriptionIndex < subscriptionCount) {
            subscriptions[subscriptionIndex].unsubscribe();
        }
    };

    CompositeSubscription.prototype.add = function add(subscription) {
        var subscriptions = this.subscriptions || (this.subscriptions = []);
        if (subscription && !subscription.isUnsubscribed) {
            if (this.isUnsubscribed) {
                subscription.unsubscribe();
            } else {
                subscriptions.push(subscription);
            }
        }
        this.length = subscriptions.length;
        return this;
    };

    CompositeSubscription.prototype.remove = function remove(subscription) {
        var isUnsubscribed = this.isUnsubscribed;
        var subscriptions = this.subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
            this.length = subscriptions.length;
        } else {
            this.length = 0;
        }
        return this;
    };

    CompositeSubscription.prototype.indexOf = function indexOf(subscription) {
        return this.subscriptions.indexOf(subscription);
    };

    return CompositeSubscription;
})();

exports['default'] = CompositeSubscription;
module.exports = exports['default'];
},{"./util/arraySlice":49}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable3 = require('./Observable');

var _Observable4 = _interopRequireDefault(_Observable3);

var _Subscriber2 = require('./Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilSymbol_observer = require('./util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var ConnectableObservable = (function (_Observable) {
    function ConnectableObservable(source, subjectFactory) {
        _classCallCheck(this, ConnectableObservable);

        _Observable.call(this, null);
        this.source = source;
        this.subjectFactory = subjectFactory;
    }

    _inherits(ConnectableObservable, _Observable);

    ConnectableObservable.prototype.connect = function connect() {
        if (!this.subscription) {
            this.subscription = this.source.subscribe(this.subject);
        }
        return this.subscription;
    };

    ConnectableObservable.prototype[_utilSymbol_observer2['default']] = function (subscriber) {
        if (!(subscriber instanceof ConnectableSubscriber)) {
            subscriber = new ConnectableSubscriber(subscriber, this);
        }
        if (!this.subject || this.subject.isUnsubscribed) {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = undefined;
            }
            this.subject = this.subjectFactory();
        }
        this.subject.subscribe(subscriber);
        return subscriber;
    };

    ConnectableObservable.prototype.refCount = function refCount() {
        return new RefCountObservable(this);
    };

    return ConnectableObservable;
})(_Observable4['default']);

exports['default'] = ConnectableObservable;

var ConnectableSubscriber = (function (_Subscriber) {
    function ConnectableSubscriber(destination, source) {
        _classCallCheck(this, ConnectableSubscriber);

        _Subscriber.call(this, destination);
        this.source = source;
    }

    _inherits(ConnectableSubscriber, _Subscriber);

    ConnectableSubscriber.prototype._complete = function _complete(value) {
        this.source.subject.remove(this);
        _Subscriber.prototype._complete.call(this, value);
    };

    return ConnectableSubscriber;
})(_Subscriber3['default']);

var RefCountObservable = (function (_Observable2) {
    function RefCountObservable(source) {
        _classCallCheck(this, RefCountObservable);

        _Observable2.call(this, null);
        this.refCount = 0;
        this.source = source;
    }

    _inherits(RefCountObservable, _Observable2);

    RefCountObservable.prototype.subscriber = function subscriber(_subscriber) {
        var _this = this;

        this.refCount++;
        this.source.subscribe(_subscriber);
        var shouldConnect = this.refCount === 1;
        if (shouldConnect) {
            this.connectionSubscription = this.source.connect();
        }
        // HACK: closure, refactor soon   
        return function () {
            _this.refCount--;
            if (_this.refCount === 0) {
                _this.connectionSubscription.unsubscribe();
            }
        };
    };

    return RefCountObservable;
})(_Observable4['default']);

module.exports = exports['default'];
},{"./Observable":4,"./Subscriber":8,"./util/Symbol_observer":48}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilSymbol_observer = require('./util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _SubscriberFactory = require('./SubscriberFactory');

var _SubscriberFactory2 = _interopRequireDefault(_SubscriberFactory);

var _Subscriber = require('./Subscriber');

var _Subscriber2 = _interopRequireDefault(_Subscriber);

var Observable = (function () {
    function Observable() {
        var subscriber = arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, Observable);

        this.source = null;
        this.subscriberFactory = new _SubscriberFactory2['default']();
        if (subscriber) {
            this.subscriber = subscriber;
        }
        this.source = this;
    }

    Observable.create = function create(subscriber) {
        return new Observable(subscriber);
    };

    Observable.prototype.subscriber = function subscriber(_subscriber) {
        return this.source.subscribe(this.subscriberFactory.create(_subscriber));
    };

    Observable.prototype.lift = function lift(subscriberFactory) {
        var observable = new Observable();
        observable.source = this;
        observable.subscriberFactory = subscriberFactory;
        return observable;
    };

    Observable.prototype[_utilSymbol_observer2['default']] = function (observer) {
        var subscriber = new _Subscriber2['default'](observer);
        subscriber.add(this.subscriber(subscriber));
        return subscriber;
    };

    Observable.prototype.subscribe = function subscribe(observerOrNext) {
        var error = arguments[1] === undefined ? null : arguments[1];
        var complete = arguments[2] === undefined ? null : arguments[2];

        var observer = undefined;
        if (typeof observerOrNext === 'object') {
            observer = observerOrNext;
        } else {
            observer = {
                next: observerOrNext,
                error: error,
                complete: complete
            };
        }
        return this[_utilSymbol_observer2['default']](observer);
    };

    Observable.prototype.forEach = function forEach(nextHandler) {
        var _this = this;

        return new Promise(function (resolve, reject) {
            var observer = {
                next: nextHandler,
                error: function error(err) {
                    reject(err);
                },
                complete: function complete(value) {
                    resolve(value);
                }
            };
            _this[_utilSymbol_observer2['default']](observer);
        });
    };

    return Observable;
})();

exports['default'] = Observable;

function dispatchSubscription(_ref) {
    var observer = _ref[0];
    var observable = _ref[1];

    return observable[_utilSymbol_observer2['default']](observer);
}
module.exports = exports['default'];
},{"./Subscriber":8,"./SubscriberFactory":9,"./util/Symbol_observer":48}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('./Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var _Subscriber = require('./Subscriber');

var _Subscriber2 = _interopRequireDefault(_Subscriber);

var _schedulerNextTick = require('./scheduler/nextTick');

var _schedulerNextTick2 = _interopRequireDefault(_schedulerNextTick);

var _schedulerImmediate = require('./scheduler/immediate');

var _schedulerImmediate2 = _interopRequireDefault(_schedulerImmediate);

var _CompositeSubscription = require('./CompositeSubscription');

var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

var _SerialSubscription = require('./SerialSubscription');

var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

var _Subject = require('./Subject');

var _Subject2 = _interopRequireDefault(_Subject);

var _BehaviorSubject = require('./BehaviorSubject');

var _BehaviorSubject2 = _interopRequireDefault(_BehaviorSubject);

var _ConnectableObservable = require('./ConnectableObservable');

var _ConnectableObservable2 = _interopRequireDefault(_ConnectableObservable);

var _observableValue = require('./observable/value');

var _observableValue2 = _interopRequireDefault(_observableValue);

var _observableReturn = require('./observable/return');

var _observableReturn2 = _interopRequireDefault(_observableReturn);

var _observableFromEventPattern = require('./observable/fromEventPattern');

var _observableFromEventPattern2 = _interopRequireDefault(_observableFromEventPattern);

var _observableFromEvent = require('./observable/fromEvent');

var _observableFromEvent2 = _interopRequireDefault(_observableFromEvent);

var _observableThrow = require('./observable/throw');

var _observableThrow2 = _interopRequireDefault(_observableThrow);

var _observableEmpty = require('./observable/empty');

var _observableEmpty2 = _interopRequireDefault(_observableEmpty);

var _observableNever = require('./observable/never');

var _observableNever2 = _interopRequireDefault(_observableNever);

var _observableRange = require('./observable/range');

var _observableRange2 = _interopRequireDefault(_observableRange);

var _observableFromArray = require('./observable/fromArray');

var _observableFromArray2 = _interopRequireDefault(_observableFromArray);

var _observableZip = require('./observable/zip');

var _observableZip2 = _interopRequireDefault(_observableZip);

var _observableFromPromise = require('./observable/fromPromise');

var _observableFromPromise2 = _interopRequireDefault(_observableFromPromise);

var _observableOf = require('./observable/of');

var _observableOf2 = _interopRequireDefault(_observableOf);

var _observableTimer = require('./observable/timer');

var _observableTimer2 = _interopRequireDefault(_observableTimer);

var _observableInterval = require('./observable/interval');

var _observableInterval2 = _interopRequireDefault(_observableInterval);

var _operatorFilter = require('./operator/filter');

var _operatorFilter2 = _interopRequireDefault(_operatorFilter);

var _operatorMap = require('./operator/map');

var _operatorMap2 = _interopRequireDefault(_operatorMap);

var _operatorMapTo = require('./operator/mapTo');

var _operatorMapTo2 = _interopRequireDefault(_operatorMapTo);

var _operatorMergeAll = require('./operator/mergeAll');

var _operatorMergeAll2 = _interopRequireDefault(_operatorMergeAll);

var _operatorFlatMap = require('./operator/flatMap');

var _operatorFlatMap2 = _interopRequireDefault(_operatorFlatMap);

var _operatorConcatAll = require('./operator/concatAll');

var _operatorConcatAll2 = _interopRequireDefault(_operatorConcatAll);

var _operatorSkip = require('./operator/skip');

var _operatorSkip2 = _interopRequireDefault(_operatorSkip);

var _operatorTake = require('./operator/take');

var _operatorTake2 = _interopRequireDefault(_operatorTake);

var _operatorSubscribeOn = require('./operator/subscribeOn');

var _operatorSubscribeOn2 = _interopRequireDefault(_operatorSubscribeOn);

var _operatorObserveOn = require('./operator/observeOn');

var _operatorObserveOn2 = _interopRequireDefault(_operatorObserveOn);

var _operatorZipAll = require('./operator/zipAll');

var _operatorZipAll2 = _interopRequireDefault(_operatorZipAll);

var _operatorZip = require('./operator/zip');

var _operatorZip2 = _interopRequireDefault(_operatorZip);

var _operatorMerge = require('./operator/merge');

var _operatorMerge2 = _interopRequireDefault(_operatorMerge);

var _operatorToArray = require('./operator/toArray');

var _operatorToArray2 = _interopRequireDefault(_operatorToArray);

var _operatorMulticast = require('./operator/multicast');

var _operatorMulticast2 = _interopRequireDefault(_operatorMulticast);

var _operatorPublish = require('./operator/publish');

var _operatorPublish2 = _interopRequireDefault(_operatorPublish);

var _operatorReduce = require('./operator/reduce');

var _operatorReduce2 = _interopRequireDefault(_operatorReduce);

_Observable2['default'].value = _observableValue2['default'];
_Observable2['default']['return'] = _observableReturn2['default'];
_Observable2['default'].fromEventPattern = _observableFromEventPattern2['default'];
_Observable2['default'].fromEvent = _observableFromEvent2['default'];
_Observable2['default']['throw'] = _observableThrow2['default'];
_Observable2['default'].empty = _observableEmpty2['default'];
_Observable2['default'].never = _observableNever2['default'];
_Observable2['default'].range = _observableRange2['default'];
_Observable2['default'].fromArray = _observableFromArray2['default'];
_Observable2['default'].zip = _observableZip2['default'];
_Observable2['default'].fromPromise = _observableFromPromise2['default'];
_Observable2['default'].of = _observableOf2['default'];
_Observable2['default'].timer = _observableTimer2['default'];
_Observable2['default'].interval = _observableInterval2['default'];
_Observable2['default'].prototype.filter = _operatorFilter2['default'];
_Observable2['default'].prototype.map = _operatorMap2['default'];
_Observable2['default'].prototype.mapTo = _operatorMapTo2['default'];
_Observable2['default'].prototype.mergeAll = _operatorMergeAll2['default'];
_Observable2['default'].prototype.flatMap = _operatorFlatMap2['default'];
_Observable2['default'].prototype.concatAll = _operatorConcatAll2['default'];
_Observable2['default'].prototype.skip = _operatorSkip2['default'];
_Observable2['default'].prototype.take = _operatorTake2['default'];
_Observable2['default'].prototype.subscribeOn = _operatorSubscribeOn2['default'];
_Observable2['default'].prototype.observeOn = _operatorObserveOn2['default'];
_Observable2['default'].prototype.zipAll = _operatorZipAll2['default'];
_Observable2['default'].prototype.zip = _operatorZip2['default'];
_Observable2['default'].prototype.merge = _operatorMerge2['default'];
_Observable2['default'].prototype.toArray = _operatorToArray2['default'];
_Observable2['default'].prototype.multicast = _operatorMulticast2['default'];
_Observable2['default'].prototype.publish = _operatorPublish2['default'];
_Observable2['default'].prototype.reduce = _operatorReduce2['default'];
var RxNext = {
    Scheduler: {
        nextTick: _schedulerNextTick2['default'],
        immediate: _schedulerImmediate2['default']
    },
    Subscriber: _Subscriber2['default'],
    Observable: _Observable2['default'],
    CompositeSubscription: _CompositeSubscription2['default'],
    SerialSubscription: _SerialSubscription2['default'],
    Subject: _Subject2['default'],
    BehaviorSubject: _BehaviorSubject2['default'],
    ConnectableObservable: _ConnectableObservable2['default']
};
exports['default'] = RxNext;
module.exports = exports['default'];
},{"./BehaviorSubject":1,"./CompositeSubscription":2,"./ConnectableObservable":3,"./Observable":4,"./SerialSubscription":6,"./Subject":7,"./Subscriber":8,"./observable/empty":11,"./observable/fromArray":12,"./observable/fromEvent":13,"./observable/fromEventPattern":14,"./observable/fromPromise":15,"./observable/interval":16,"./observable/never":17,"./observable/of":18,"./observable/range":19,"./observable/return":20,"./observable/throw":21,"./observable/timer":22,"./observable/value":23,"./observable/zip":24,"./operator/concatAll":25,"./operator/filter":26,"./operator/flatMap":27,"./operator/map":28,"./operator/mapTo":29,"./operator/merge":30,"./operator/mergeAll":31,"./operator/multicast":32,"./operator/observeOn":33,"./operator/publish":34,"./operator/reduce":35,"./operator/skip":36,"./operator/subscribeOn":37,"./operator/take":38,"./operator/toArray":39,"./operator/zip":40,"./operator/zipAll":41,"./scheduler/immediate":45,"./scheduler/nextTick":46}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SerialSubscription = (function () {
    function SerialSubscription(subscription) {
        _classCallCheck(this, SerialSubscription);

        this.isUnsubscribed = false;
        this.subscription = subscription;
    }

    SerialSubscription.prototype.add = function add(subscription) {
        if (subscription) {
            if (this.isUnsubscribed) {
                subscription.unsubscribe();
            } else {
                var currentSubscription = this.subscription;
                this.subscription = subscription;
                if (currentSubscription) {
                    currentSubscription.unsubscribe();
                }
            }
        }
        return this;
    };

    SerialSubscription.prototype.remove = function remove(subscription) {
        if (this.subscription === subscription) {
            this.subscription = undefined;
        }
        return this;
    };

    SerialSubscription.prototype.unsubscribe = function unsubscribe() {
        if (!this.isUnsubscribed) {
            this.isUnsubscribed = true;
            var subscription = this.subscription;
            if (subscription) {
                this.subscription = undefined;
                subscription.unsubscribe();
            }
        }
    };

    return SerialSubscription;
})();

exports["default"] = SerialSubscription;
module.exports = exports["default"];
},{}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('./Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscriber = require('./Subscriber');

var _Subscriber2 = _interopRequireDefault(_Subscriber);

var _utilSymbol_observer = require('./util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var Subject = (function (_Observable) {
    function Subject() {
        _classCallCheck(this, Subject);

        _Observable.call(this, null);
        this.disposed = false;
        this.subscribers = [];
        this.isUnsubscribed = false;
    }

    _inherits(Subject, _Observable);

    Subject.prototype[_utilSymbol_observer2['default']] = function (subscriber) {
        if (!(subscriber instanceof _Subscriber2['default'])) {
            subscriber = new _Subscriber2['default'](subscriber);
        }
        this.add(subscriber);
        //HACK: return a subscription that will remove the subscriber from the list
        return {
            subscriber: subscriber,
            subject: this,
            isUnsubscribed: false,
            add: function add() {},
            remove: function remove() {},
            unsubscribe: function unsubscribe() {
                this.isUnsubscribed = true;
                this.subscriber.unsubscribe;
                this.subject.remove(this.subscriber);
            }
        };
    };

    Subject.prototype.next = function next(value) {
        if (this.isUnsubscribed) {
            return;
        }
        this.subscribers.forEach(function (o) {
            return o.next(value);
        });
    };

    Subject.prototype.error = function error(err) {
        if (this.isUnsubscribed) {
            return;
        }
        this.subscribers.forEach(function (o) {
            return o.error(err);
        });
        this.unsubscribe();
    };

    Subject.prototype.complete = function complete(value) {
        if (this.isUnsubscribed) {
            return;
        }
        this.subscribers.forEach(function (o) {
            return o.complete(value);
        });
        this.unsubscribe();
    };

    Subject.prototype.add = function add(subscriber) {
        this.subscribers.push(subscriber);
    };

    Subject.prototype.remove = function remove(subscriber) {
        var index = this.subscribers.indexOf(subscriber);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    };

    Subject.prototype.unsubscribe = function unsubscribe() {
        this.subscribers.length = 0;
        this.isUnsubscribed = true;
    };

    return Subject;
})(_Observable3['default']);

exports['default'] = Subject;
module.exports = exports['default'];
},{"./Observable":4,"./Subscriber":8,"./util/Symbol_observer":48}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Subscriber = (function () {
    function Subscriber(destination) {
        _classCallCheck(this, Subscriber);

        this.isUnsubscribed = false;
        this.subscriptions = [];
        this.destination = destination;
    }

    Subscriber.prototype.next = function next(value) {
        if (!this.isUnsubscribed) {
            this._next(value);
        }
    };

    Subscriber.prototype._next = function _next(value) {
        if (this.destination) {
            this.destination.next(value);
        }
    };

    Subscriber.prototype.error = function error(err) {
        if (!this.isUnsubscribed) {
            this._error(err);
            this.unsubscribe();
        }
    };

    Subscriber.prototype._error = function _error(err) {
        var destination = this.destination;
        if (destination && destination.error) {
            destination.error(err);
        } else {
            throw err;
        }
    };

    Subscriber.prototype.complete = function complete() {
        var value = arguments[0] === undefined ? undefined : arguments[0];

        if (!this.isUnsubscribed) {
            this._complete(value);
            this.unsubscribe();
        }
    };

    Subscriber.prototype._complete = function _complete(value) {
        var destination = this.destination;
        if (destination && destination.complete) {
            destination.complete(value);
        }
    };

    Subscriber.prototype.subscribe = function subscribe(subscription) {
        this._subscribe(subscription);
    };

    Subscriber.prototype._subscribe = function _subscribe(subscription) {
        var destination = this.destination;
        if (destination && destination.subscribe) {
            destination.subscribe(subscription);
        }
    };

    Subscriber.prototype.unsubscribe = function unsubscribe() {
        this.isUnsubscribed = true;
        while (this.subscriptions.length > 0) {
            var sub = this.subscriptions.shift();
            sub.unsubscribe();
        }
    };

    Subscriber.prototype.add = function add(subscriptionOrAction) {
        if (!subscriptionOrAction) {
            return;
        }
        var subscription = typeof subscriptionOrAction === 'function' ? { unsubscribe: subscriptionOrAction } : subscriptionOrAction;
        if (this.isUnsubscribed) {
            subscription.unsubscribe();
        } else if (typeof subscription.unsubscribe === 'function') {
            this.subscriptions.push(subscription);
        }
    };

    Subscriber.prototype.remove = function remove(subscription) {
        var index = this.subscriptions.indexOf(subscription);
        if (index !== -1) {
            this.subscriptions.splice(index, 1);
        }
    };

    return Subscriber;
})();

exports['default'] = Subscriber;
module.exports = exports['default'];
},{}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Subscriber = require('./Subscriber');

var _Subscriber2 = _interopRequireDefault(_Subscriber);

var SubscriberFactory = (function () {
    function SubscriberFactory() {
        _classCallCheck(this, SubscriberFactory);
    }

    SubscriberFactory.prototype.create = function create(destination) {
        return new _Subscriber2['default'](destination);
    };

    return SubscriberFactory;
})();

exports['default'] = SubscriberFactory;
module.exports = exports['default'];
},{"./Subscriber":8}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var ArrayObservable = (function (_Observable) {
    function ArrayObservable(array) {
        _classCallCheck(this, ArrayObservable);

        _Observable.call(this, null);
        this.array = array;
    }

    _inherits(ArrayObservable, _Observable);

    ArrayObservable.prototype.subscriber = function subscriber(_subscriber) {
        var i, len;
        var array = this.array;
        if (Array.isArray(array)) {
            for (i = 0, len = array.length; i < len && !_subscriber.isUnsubscribed; i++) {
                _subscriber.next(array[i]);
            }
        }
        if (_subscriber.complete) _subscriber.complete();
    };

    return ArrayObservable;
})(_Observable3['default']);

exports['default'] = ArrayObservable;
module.exports = exports['default'];
},{"../Observable":4}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = empty;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var EMPTY = new _Observable2['default'](function (subscriber) {
    subscriber.complete();
});

function empty() {
    return EMPTY;
}

;
module.exports = exports['default'];
},{"../Observable":4}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = fromArray;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ArrayObservable = require('./ArrayObservable');

var _ArrayObservable2 = _interopRequireDefault(_ArrayObservable);

function fromArray(array) {
    return new _ArrayObservable2['default'](array);
}

module.exports = exports['default'];
},{"./ArrayObservable":10}],13:[function(require,module,exports){
// class EventListenerObservable extends Observable {
//   element:Object;
//   eventName:string;
//   selector:Function;
//   constructor(element, eventName, selector) {
//     super(null);
//     this.element = element;
//     this.eventName = eventName;
//     this.selector = selector;
//   }
//   subscriber(subscriber: Subscriber) {
//     var selector = this.selector;
//     var listeners = createEventListener(
//         this.element, this.eventName,
//         function handler(e) {
//             var result = e;
//             var iteratorResult;
//             if (selector) {
//               result = try_catch(selector).apply(this, arguments);
//               if(result === error_obj) {
//                 subscriber.error(error_obj.e);
//                 listeners.unsubscribe();
//                 return;
//               }
//             }
//             iteratorResult = subscriber.next(result);
//             if(iteratorResult.done) {
//               listeners.unsubscribe();
//             }
//         }, subscriber);
//     return listeners;
//   }
// }
// function createListener(element:any, name:string, handler:Function, subscriber:Subscriber) : Subscription {
//     if (element.addEventListener) {
//         element.addEventListener(name, handler, false);
//         return new Subscription(function () {
//             element.removeEventListener(name, handler, false);
//         }, subscriber);
//     }
//     throw new Error('No listener found.');
// }
// function createEventListener(element:any, eventName:string, handler:Function, subscriber:Subscriber) : Subscription {
//     var subscriptions = new CompositeSubscription();
//     // Asume NodeList
//     if (Object.prototype.toString.call(element) === '[object NodeList]') {
//         for (var i = 0, len = element.length; i < len; i++) {
//             subscriptions.add(createEventListener(element.item(i), eventName, handler, subscriber));
//         }
//     } else if (element) {
//         subscriptions.add(createListener(element, eventName, handler, subscriber));
//     }
//     return subscriptions;
// }
/**
 * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
 *
 * @example
 *   var source = Rx.Observable.fromEvent(element, 'mouseup');
 *
 * @param {any} element The DOMElement or NodeList to attach a listener.
 * @param {string} eventName The event name to attach the observable sequence.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence of events from the specified element and the specified event.
 */
'use strict';

exports.__esModule = true;
exports['default'] = fromEvent;

function fromEvent(element, eventName) {
    var selector = arguments[2] === undefined ? null : arguments[2];

    throw 'Not implemented';
    // Node.js specific
    // if (element.addListener) {
    //     return fromEventPattern(
    //         function (h) {
    //             element.addListener(eventName, h);
    //         },
    //         function (h) {
    //             element.removeListener(eventName, h);
    //         },
    //         selector);
    // }
    // var config = this.config || {};
    // // Use only if non-native events are allowed
    // if (!config.useNativeEvents) {
    //     // Handles jq, Angular.js, Zepto, Marionette, Ember.js
    //     if (typeof element.on === 'function' && typeof element.off === 'function') {
    //         return fromEventPattern(
    //             function (h) {
    //                 element.on(eventName, h);
    //             },
    //             function (h) {
    //                 element.off(eventName, h);
    //             },
    //             selector);
    //     }
    // }
    // return new EventListenerObservable(element, eventName, selector);
}

;
module.exports = exports['default'];
},{}],14:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = fromEventPattern;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var FromEventPatternObservable = (function (_Observable) {
    function FromEventPatternObservable(add, remove, selector) {
        _classCallCheck(this, FromEventPatternObservable);

        _Observable.call(this, null);
        this.add = add;
        this.remove = remove;
        this.selector = selector;
    }

    _inherits(FromEventPatternObservable, _Observable);

    FromEventPatternObservable.prototype.subscriber = function subscriber(_subscriber) {
        var unsubscribe = function unsubscribe() {
            if (remove) {
                remove(innerHandler, token);
            }
        };
        function innerHandler(e) {
            var result = e;
            if (selector) {
                result = _utilTryCatch2['default'](selector).apply(this, arguments);
                if (result === _utilErrorObject2['default']) {
                    _subscriber.error(_utilErrorObject2['default'].e);
                    unsubscribe();
                    return;
                }
            }
            result = _subscriber.next(result);
            if (result.done) {
                unsubscribe();
            }
        }
        var self = this;
        var remove = this.remove;
        var selector = this.selector;
        var token = this.add(innerHandler);
        return unsubscribe;
    };

    return FromEventPatternObservable;
})(_Observable3['default']);

/**
 * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
 * @param {Function} addHandler The function to add a handler to the emitter.
 * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence which wraps an event from an event emitter
 */

function fromEventPattern(addHandler) {
    var removeHandler = arguments[1] === undefined ? null : arguments[1];
    var selector = arguments[2] === undefined ? null : arguments[2];

    return new FromEventPatternObservable(addHandler, removeHandler, selector);
}

;
module.exports = exports['default'];
},{"../Observable":4,"../util/errorObject":50,"../util/tryCatch":52}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = fromPromise;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var PromiseObservable = (function (_Observable) {
    function PromiseObservable(promise) {
        _classCallCheck(this, PromiseObservable);

        _Observable.call(this, null);
        this.promise = promise;
    }

    _inherits(PromiseObservable, _Observable);

    PromiseObservable.prototype.subscriber = function subscriber(_subscriber) {
        var promise = this.promise;
        if (promise) {
            promise.then(function (x) {
                if (!_subscriber.isUnsubscribed) {
                    _subscriber.next(x);
                    _subscriber.complete();
                }
            }, function (e) {
                if (!_subscriber.isUnsubscribed) {
                    _subscriber.error(e);
                }
            });
        }
    };

    return PromiseObservable;
})(_Observable3['default']);

function fromPromise(promise) {
    return new PromiseObservable(promise);
}

module.exports = exports['default'];
},{"../Observable":4}],16:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = timer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _schedulerNextTick = require('../scheduler/nextTick');

var _schedulerNextTick2 = _interopRequireDefault(_schedulerNextTick);

var IntervalObservable = (function (_Observable) {
    function IntervalObservable(interval, scheduler) {
        _classCallCheck(this, IntervalObservable);

        _Observable.call(this, null);
        this.interval = interval;
        this.scheduler = scheduler;
    }

    _inherits(IntervalObservable, _Observable);

    IntervalObservable.prototype.subscriber = function subscriber(observer) {
        this.scheduler.schedule(this.interval, new IntervalSubscriber(observer, this.interval, this.scheduler), dispatch);
    };

    return IntervalObservable;
})(_Observable3['default']);

var IntervalSubscriber = (function (_Subscriber) {
    function IntervalSubscriber(destination, interval, scheduler) {
        _classCallCheck(this, IntervalSubscriber);

        _Subscriber.call(this, destination);
        this.counter = 0;
        this.interval = interval;
        this.scheduler = scheduler;
    }

    _inherits(IntervalSubscriber, _Subscriber);

    IntervalSubscriber.prototype.emitNext = function emitNext() {
        if (!this.isUnsubscribed) {
            this.next(this.counter++);
            this.scheduler.schedule(this.interval, this, dispatch);
        }
    };

    return IntervalSubscriber;
})(_Subscriber3['default']);

function dispatch(observer) {
    observer.emitNext();
}

function timer() {
    var interval = arguments[0] === undefined ? 0 : arguments[0];
    var scheduler = arguments[1] === undefined ? _schedulerNextTick2['default'] : arguments[1];

    return new IntervalObservable(interval, scheduler);
}

;
module.exports = exports['default'];
},{"../Observable":4,"../Subscriber":8,"../scheduler/nextTick":46}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = never;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var NEVER = new _Observable2['default'](function (observer) {});

function never() {
    return NEVER; // NEVER!!!!
}

module.exports = exports['default'];
},{"../Observable":4}],18:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = of;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ArrayObservable = require('./ArrayObservable');

var _ArrayObservable2 = _interopRequireDefault(_ArrayObservable);

function of() {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
    }

    return new _ArrayObservable2['default'](values);
}

;
module.exports = exports['default'];
},{"./ArrayObservable":10}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = range;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var RangeObservable = (function (_Observable) {
    function RangeObservable(start, end) {
        _classCallCheck(this, RangeObservable);

        _Observable.call(this, null);
        this.end = end;
        this.start = start;
    }

    _inherits(RangeObservable, _Observable);

    RangeObservable.prototype.subscriber = function subscriber(_subscriber) {
        var end = this.end;
        var start = this.start;
        var i;
        for (i = start; i < end && !_subscriber.isUnsubscribed; i++) {
            _subscriber.next(i);
        }
        _subscriber.complete();
    };

    return RangeObservable;
})(_Observable3['default']);

function range() {
    var start = arguments[0] === undefined ? 0 : arguments[0];
    var end = arguments[1] === undefined ? 0 : arguments[1];

    return new RangeObservable(Math.min(start, end), Math.max(start, end));
}

;
module.exports = exports['default'];
},{"../Observable":4}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = _return;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var ReturnObservable = (function (_Observable) {
    function ReturnObservable(returnValue) {
        _classCallCheck(this, ReturnObservable);

        _Observable.call(this, null);
        this.returnValue = returnValue;
    }

    _inherits(ReturnObservable, _Observable);

    ReturnObservable.prototype.subscriber = function subscriber(_subscriber) {
        _subscriber.complete(this.returnValue);
    };

    return ReturnObservable;
})(_Observable3['default']);

function _return() {
    var returnValue = arguments[0] === undefined ? undefined : arguments[0];

    return new ReturnObservable(returnValue);
}

module.exports = exports['default'];
},{"../Observable":4}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = _throw;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var ThrowObservable = (function (_Observable) {
    function ThrowObservable(err) {
        _classCallCheck(this, ThrowObservable);

        _Observable.call(this, null);
        this.err = err;
    }

    _inherits(ThrowObservable, _Observable);

    ThrowObservable.prototype.subscriber = function subscriber(_subscriber) {
        _subscriber.error(this.err);
    };

    return ThrowObservable;
})(_Observable3['default']);

var EMPTY_THROW = new ThrowObservable(undefined);

function _throw() {
    var err = arguments[0] === undefined ? undefined : arguments[0];

    return err ? new ThrowObservable(err) : EMPTY_THROW;
}

;
module.exports = exports['default'];
},{"../Observable":4}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = timer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _schedulerNextTick = require('../scheduler/nextTick');

var _schedulerNextTick2 = _interopRequireDefault(_schedulerNextTick);

var TimerObservable = (function (_Observable) {
    function TimerObservable(delay, scheduler) {
        _classCallCheck(this, TimerObservable);

        _Observable.call(this, null);
        this.delay = delay;
        this.scheduler = scheduler;
    }

    _inherits(TimerObservable, _Observable);

    TimerObservable.prototype.subscriber = function subscriber(_subscriber) {
        return this.scheduler.schedule(this.delay, _subscriber, dispatch);
    };

    return TimerObservable;
})(_Observable3['default']);

function dispatch(subscriber) {
    if (!subscriber.isUnsubscribed) {
        subscriber.next(0);
        subscriber.complete();
    }
}

function timer() {
    var delay = arguments[0] === undefined ? 0 : arguments[0];
    var scheduler = arguments[1] === undefined ? _schedulerNextTick2['default'] : arguments[1];

    return new TimerObservable(delay, scheduler);
}

;
module.exports = exports['default'];
},{"../Observable":4,"../scheduler/nextTick":46}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = value;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var ValueObservable = (function (_Observable) {
    function ValueObservable(value) {
        _classCallCheck(this, ValueObservable);

        _Observable.call(this, null);
        this.value = value;
    }

    _inherits(ValueObservable, _Observable);

    ValueObservable.prototype.subscriber = function subscriber(_subscriber) {
        _subscriber.next(this.value);
        _subscriber.complete();
    };

    return ValueObservable;
})(_Observable3['default']);

function value(value) {
    return new ValueObservable(value);
}

;
module.exports = exports['default'];
},{"../Observable":4}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = zip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilSymbol_observer = require('../util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var ZipObservable = (function (_Observable) {
    function ZipObservable(observables, project) {
        _classCallCheck(this, ZipObservable);

        _Observable.call(this, null);
        this.observables = observables;
        this.project = project;
    }

    _inherits(ZipObservable, _Observable);

    ZipObservable.prototype.subscriber = function subscriber(_subscriber) {
        var _this = this;

        this.observables.forEach(function (obs, i) {
            var innerSubscriber = new InnerZipSubscriber(_subscriber, i, _this.project, obs);
            _subscriber.add(obs[_utilSymbol_observer2['default']](innerSubscriber));
        });
        return _subscriber;
    };

    return ZipObservable;
})(_Observable3['default']);

var InnerZipSubscriber = (function (_Subscriber) {
    function InnerZipSubscriber(destination, index, project, observable) {
        _classCallCheck(this, InnerZipSubscriber);

        _Subscriber.call(this, destination);
        this.buffer = [];
        this.index = index;
        this.project = project;
        this.observable = observable;
    }

    _inherits(InnerZipSubscriber, _Subscriber);

    InnerZipSubscriber.prototype._next = function _next(value) {
        this.buffer.push(value);
    };

    InnerZipSubscriber.prototype._canEmit = function _canEmit() {
        return this.subscriptions.every(function (subscription) {
            var sub = subscription;
            return !sub.isUnsubscribed && sub.buffer.length > 0;
        });
    };

    InnerZipSubscriber.prototype._getArgs = function _getArgs() {
        return this.subscriptions.reduce(function (args, subcription) {
            var sub = subcription;
            args.push(sub.buffer.shift());
            return args;
        }, []);
    };

    InnerZipSubscriber.prototype._checkNext = function _checkNext() {
        if (this._canEmit()) {
            var args = this._getArgs();
            return this._sendNext(args);
        }
    };

    InnerZipSubscriber.prototype._sendNext = function _sendNext(args) {
        var value = _utilTryCatch2['default'](this.project).apply(this, args);
        if (value === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.destination.next(value);
        }
    };

    return InnerZipSubscriber;
})(_Subscriber3['default']);

function zip(observables, project) {
    return new ZipObservable(observables, project);
}

module.exports = exports['default'];
},{"../Observable":4,"../Subscriber":8,"../util/Symbol_observer":48,"../util/errorObject":50,"../util/tryCatch":52}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = concatAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mergeAll = require('./mergeAll');

var _mergeAll2 = _interopRequireDefault(_mergeAll);

function concatAll() {
    return _mergeAll2['default'].call(this, 1);
}

module.exports = exports['default'];
},{"./mergeAll":31}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = select;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var FilterSubscriber = (function (_Subscriber) {
    function FilterSubscriber(destination, predicate) {
        _classCallCheck(this, FilterSubscriber);

        _Subscriber.call(this, destination);
        this.predicate = predicate;
    }

    _inherits(FilterSubscriber, _Subscriber);

    FilterSubscriber.prototype._next = function _next(value) {
        var result = _utilTryCatch2['default'](this.predicate).call(this, value);
        if (result === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else if (Boolean(result)) {
            this.destination.next(value);
        }
    };

    return FilterSubscriber;
})(_Subscriber3['default']);

var FilterSubscriberFactory = (function (_SubscriberFactory) {
    function FilterSubscriberFactory(predicate) {
        _classCallCheck(this, FilterSubscriberFactory);

        _SubscriberFactory.call(this);
        this.predicate = predicate;
    }

    _inherits(FilterSubscriberFactory, _SubscriberFactory);

    FilterSubscriberFactory.prototype.create = function create(destination) {
        return new FilterSubscriber(destination, this.predicate);
    };

    return FilterSubscriberFactory;
})(_SubscriberFactory3['default']);

function select(predicate) {
    return this.lift(new FilterSubscriberFactory(predicate));
}

;
module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9,"../util/errorObject":50,"../util/tryCatch":52}],27:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = flatMap;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _mergeAll = require('./mergeAll');

var _mergeAll2 = _interopRequireDefault(_mergeAll);

function flatMap(project) {
    var concurrent = arguments[1] === undefined ? Number.POSITIVE_INFINITY : arguments[1];

    return _mergeAll2['default'].call(_map2['default'].call(this, project), concurrent);
}

module.exports = exports['default'];
},{"./map":28,"./mergeAll":31}],28:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = select;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var MapSubscriber = (function (_Subscriber) {
    function MapSubscriber(destination, project) {
        _classCallCheck(this, MapSubscriber);

        _Subscriber.call(this, destination);
        this.project = project;
    }

    _inherits(MapSubscriber, _Subscriber);

    MapSubscriber.prototype._next = function _next(value) {
        value = _utilTryCatch2['default'](this.project).call(this, value);
        if (value === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.destination.next(value);
        }
    };

    return MapSubscriber;
})(_Subscriber3['default']);

var MapSubscriberFactory = (function (_SubscriberFactory) {
    function MapSubscriberFactory(project) {
        _classCallCheck(this, MapSubscriberFactory);

        _SubscriberFactory.call(this);
        this.project = project;
    }

    _inherits(MapSubscriberFactory, _SubscriberFactory);

    MapSubscriberFactory.prototype.create = function create(destination) {
        return new MapSubscriber(destination, this.project);
    };

    return MapSubscriberFactory;
})(_SubscriberFactory3['default']);

function select(project) {
    return this.lift(new MapSubscriberFactory(project));
}

;
module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9,"../util/errorObject":50,"../util/tryCatch":52}],29:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = mapTo;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var MapToSubscriber = (function (_Subscriber) {
    function MapToSubscriber(destination, value) {
        _classCallCheck(this, MapToSubscriber);

        _Subscriber.call(this, destination);
        this.value = value;
    }

    _inherits(MapToSubscriber, _Subscriber);

    MapToSubscriber.prototype._next = function _next(_) {
        return this.destination.next(this.value);
    };

    return MapToSubscriber;
})(_Subscriber3['default']);

var MapToSubscriberFactory = (function (_SubscriberFactory) {
    function MapToSubscriberFactory(value) {
        _classCallCheck(this, MapToSubscriberFactory);

        _SubscriberFactory.call(this);
        this.value = value;
    }

    _inherits(MapToSubscriberFactory, _SubscriberFactory);

    MapToSubscriberFactory.prototype.create = function create(destination) {
        return new MapToSubscriber(destination, this.value);
    };

    return MapToSubscriberFactory;
})(_SubscriberFactory3['default']);

function mapTo(value) {
    return this.lift(new MapToSubscriberFactory(value));
}

;
module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9}],30:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = merge;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function merge(observables) {
    return _Observable2['default'].fromArray([this].concat(observables)).mergeAll();
}

module.exports = exports['default'];
},{"../Observable":4}],31:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = mergeAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber3 = require('../Subscriber');

var _Subscriber4 = _interopRequireDefault(_Subscriber3);

var _utilSymbol_observer = require('../util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var MergeAllSubscriber = (function (_Subscriber) {
    function MergeAllSubscriber(destination, concurrent) {
        _classCallCheck(this, MergeAllSubscriber);

        _Subscriber.call(this, destination);
        this.stopped = false;
        this.buffer = [];
        this.concurrent = concurrent;
    }

    _inherits(MergeAllSubscriber, _Subscriber);

    MergeAllSubscriber.prototype.next = function next(observable) {
        var buffer = this.buffer;
        var concurrent = this.concurrent;
        var subscriptions = this.subscriptions;
        if (subscriptions.length < concurrent) {
            var innerSubscriber = new MergeInnerSubscriber(this);
            this.add(innerSubscriber);
            innerSubscriber.add(observable[_utilSymbol_observer2['default']](innerSubscriber));
        } else if (buffer) {
            buffer.push(observable);
        }
    };

    MergeAllSubscriber.prototype.complete = function complete(value) {
        this.stopped = true;
        if (this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
            this.destination.complete(value);
        }
    };

    MergeAllSubscriber.prototype._innerComplete = function _innerComplete(innerSubscriber) {
        var buffer = this.buffer;
        this.remove(innerSubscriber);
        if (this.subscriptions.length < this.concurrent) {
            if (buffer && buffer.length > 0) {
                this.next(buffer.shift());
            } else if (this.stopped && this.subscriptions.length === 0) {
                return this.destination.complete();
            }
        }
    };

    return MergeAllSubscriber;
})(_Subscriber4['default']);

var MergeInnerSubscriber = (function (_Subscriber2) {
    function MergeInnerSubscriber(parent) {
        _classCallCheck(this, MergeInnerSubscriber);

        _Subscriber2.call(this, parent.destination);
        this.parent = parent;
    }

    _inherits(MergeInnerSubscriber, _Subscriber2);

    MergeInnerSubscriber.prototype._complete = function _complete(value) {
        return this.parent._innerComplete(this);
    };

    return MergeInnerSubscriber;
})(_Subscriber4['default']);

var MergeAllSubscriberFactory = (function (_SubscriberFactory) {
    function MergeAllSubscriberFactory(concurrent) {
        _classCallCheck(this, MergeAllSubscriberFactory);

        _SubscriberFactory.call(this);
        this.concurrent = concurrent;
    }

    _inherits(MergeAllSubscriberFactory, _SubscriberFactory);

    MergeAllSubscriberFactory.prototype.create = function create(destination) {
        return new MergeAllSubscriber(destination, this.concurrent);
    };

    return MergeAllSubscriberFactory;
})(_SubscriberFactory3['default']);

function mergeAll() {
    var concurrent = arguments[0] === undefined ? Number.POSITIVE_INFINITY : arguments[0];

    return this.lift(new MergeAllSubscriberFactory(concurrent));
}

;
module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9,"../util/Symbol_observer":48}],32:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = multicast;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ConnectableObservable = require('../ConnectableObservable');

var _ConnectableObservable2 = _interopRequireDefault(_ConnectableObservable);

function multicast(subjectFactory) {
    return new _ConnectableObservable2['default'](this, subjectFactory);
}

;
module.exports = exports['default'];
},{"../ConnectableObservable":3}],33:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = observeOn;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var ObserveOnSubscriber = (function (_Subscriber) {
    function ObserveOnSubscriber(destination, scheduler) {
        _classCallCheck(this, ObserveOnSubscriber);

        _Subscriber.call(this, destination);
        this.scheduler = scheduler;
    }

    _inherits(ObserveOnSubscriber, _Subscriber);

    ObserveOnSubscriber.prototype.next = function next(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchNext);
    };

    ObserveOnSubscriber.prototype._error = function _error(err) {
        this.scheduler.schedule(0, [this.destination, err], dispatchError);
    };

    ObserveOnSubscriber.prototype._complete = function _complete(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchComplete);
    };

    return ObserveOnSubscriber;
})(_Subscriber3['default']);

function dispatchNext(_ref) {
    var destination = _ref[0];
    var value = _ref[1];

    var result = destination.next(value);
    if (result.done) {
        destination.dispose();
    }
}
function dispatchError(_ref2) {
    var destination = _ref2[0];
    var err = _ref2[1];

    var result = destination.error(err);
    destination.dispose();
}
function dispatchComplete(_ref3) {
    var destination = _ref3[0];
    var value = _ref3[1];

    var result = destination.complete(value);
    destination.dispose();
}

var ObserveOnSubscriberFactory = (function (_SubscriberFactory) {
    function ObserveOnSubscriberFactory(scheduler) {
        _classCallCheck(this, ObserveOnSubscriberFactory);

        _SubscriberFactory.call(this);
        this.scheduler = scheduler;
    }

    _inherits(ObserveOnSubscriberFactory, _SubscriberFactory);

    ObserveOnSubscriberFactory.prototype.create = function create(destination) {
        return new ObserveOnSubscriber(destination, this.scheduler);
    };

    return ObserveOnSubscriberFactory;
})(_SubscriberFactory3['default']);

function observeOn(scheduler) {
    return this.lift(new ObserveOnSubscriberFactory(scheduler));
}

module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9}],34:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = publish;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Subject = require('../Subject');

var _Subject2 = _interopRequireDefault(_Subject);

function subjectFactory() {
    return new _Subject2['default']();
}

function publish() {
    return this.multicast(subjectFactory);
}

module.exports = exports['default'];
},{"../Subject":7}],35:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = reduce;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var ReduceSubscriber = (function (_Subscriber) {
    function ReduceSubscriber(destination, processor, initialValue) {
        _classCallCheck(this, ReduceSubscriber);

        _Subscriber.call(this, destination);
        this.processor = processor;
        this.aggregate = initialValue;
    }

    _inherits(ReduceSubscriber, _Subscriber);

    ReduceSubscriber.prototype._next = function _next(value) {
        var result = _utilTryCatch2['default'](this.processor)(this.aggregate, value);
        if (result === _utilErrorObject2['default'].e) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.aggregate = result;
        }
    };

    ReduceSubscriber.prototype._complete = function _complete(value) {
        this.destination.next(this.aggregate);
        this.destination.complete(value);
    };

    return ReduceSubscriber;
})(_Subscriber3['default']);

var ReduceSubscriberFactory = (function (_SubscriberFactory) {
    function ReduceSubscriberFactory(processor, initialValue) {
        _classCallCheck(this, ReduceSubscriberFactory);

        _SubscriberFactory.call(this);
        this.processor = processor;
        this.initialValue = initialValue;
    }

    _inherits(ReduceSubscriberFactory, _SubscriberFactory);

    ReduceSubscriberFactory.prototype.create = function create(destination) {
        return new ReduceSubscriber(destination, this.processor, this.initialValue);
    };

    return ReduceSubscriberFactory;
})(_SubscriberFactory3['default']);

function reduce(processor, initialValue) {
    return this.lift(new ReduceSubscriberFactory(processor, initialValue));
}

module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9,"../util/errorObject":50,"../util/tryCatch":52}],36:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = skip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var SkipSubscriber = (function (_Subscriber) {
    function SkipSubscriber(destination, count) {
        _classCallCheck(this, SkipSubscriber);

        _Subscriber.call(this, destination);
        this.counter = 0;
        this.count = count;
    }

    _inherits(SkipSubscriber, _Subscriber);

    SkipSubscriber.prototype._next = function _next(value) {
        if (this.counter++ >= this.count) {
            return this.destination.next(value);
        }
    };

    return SkipSubscriber;
})(_Subscriber3['default']);

var SkipSubscriberFactory = (function (_SubscriberFactory) {
    function SkipSubscriberFactory(count) {
        _classCallCheck(this, SkipSubscriberFactory);

        _SubscriberFactory.call(this);
        this.count = count;
    }

    _inherits(SkipSubscriberFactory, _SubscriberFactory);

    SkipSubscriberFactory.prototype.create = function create(destination) {
        return new SkipSubscriber(destination, this.count);
    };

    return SkipSubscriberFactory;
})(_SubscriberFactory3['default']);

function skip(count) {
    return this.lift(new SkipSubscriberFactory(count));
}

;
module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9}],37:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = subscribeOn;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _utilSymbol_observer = require('../util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _SerialSubscription = require('../SerialSubscription');

var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

var SubscribeOnObservable = (function (_Observable) {
    function SubscribeOnObservable(source, scheduler) {
        _classCallCheck(this, SubscribeOnObservable);

        _Observable.call(this, null);
        this.source = source;
        this.scheduler = scheduler;
    }

    _inherits(SubscribeOnObservable, _Observable);

    SubscribeOnObservable.prototype[_utilSymbol_observer2['default']] = function (observer) {
        var subscription = new _SerialSubscription2['default'](null);
        var observerFn = _Observable3['default'].prototype[_utilSymbol_observer2['default']]; //HACK: https://github.com/Microsoft/TypeScript/issues/3573
        this.scheduler.schedule(0, [this, observer, observerFn, subscription], dispatchSubscription);
        return subscription;
    };

    return SubscribeOnObservable;
})(_Observable3['default']);

function dispatchSubscription(_ref) {
    var observable = _ref[0];
    var observer = _ref[1];
    var observerFn = _ref[2];
    var subscription = _ref[3];

    subscription.add(observerFn.call(observable, observer));
}

function subscribeOn(scheduler) {
    return new SubscribeOnObservable(this, scheduler);
}

;
module.exports = exports['default'];
},{"../Observable":4,"../SerialSubscription":6,"../util/Symbol_observer":48}],38:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = take;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var TakeSubscriber = (function (_Subscriber) {
    function TakeSubscriber(destination, count) {
        _classCallCheck(this, TakeSubscriber);

        _Subscriber.call(this, destination);
        this.counter = 0;
        this.count = count;
    }

    _inherits(TakeSubscriber, _Subscriber);

    TakeSubscriber.prototype._next = function _next(value) {
        if (this.counter++ < this.count) {
            this.destination.next(value);
        } else {
            this.destination.complete();
        }
    };

    return TakeSubscriber;
})(_Subscriber3['default']);

var TakeSubscriberFactory = (function (_SubscriberFactory) {
    function TakeSubscriberFactory(count) {
        _classCallCheck(this, TakeSubscriberFactory);

        _SubscriberFactory.call(this);
        this.count = count;
    }

    _inherits(TakeSubscriberFactory, _SubscriberFactory);

    TakeSubscriberFactory.prototype.create = function create(destination) {
        return new TakeSubscriber(destination, this.count);
    };

    return TakeSubscriberFactory;
})(_SubscriberFactory3['default']);

function take(count) {
    return this.lift(new TakeSubscriberFactory(count));
}

;
module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9}],39:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = toArray;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var ToArraySubscriber = (function (_Subscriber) {
    function ToArraySubscriber(destination) {
        _classCallCheck(this, ToArraySubscriber);

        _Subscriber.call(this, destination);
        this.array = [];
    }

    _inherits(ToArraySubscriber, _Subscriber);

    ToArraySubscriber.prototype._next = function _next(value) {
        this.array.push(value);
    };

    ToArraySubscriber.prototype._complete = function _complete(value) {
        this.destination.next(this.array);
        this.destination.complete(value);
    };

    return ToArraySubscriber;
})(_Subscriber3['default']);

var ToArraySubscriberFactory = (function (_SubscriberFactory) {
    function ToArraySubscriberFactory() {
        _classCallCheck(this, ToArraySubscriberFactory);

        _SubscriberFactory.apply(this, arguments);
    }

    _inherits(ToArraySubscriberFactory, _SubscriberFactory);

    ToArraySubscriberFactory.prototype.create = function create(destination) {
        return new ToArraySubscriber(destination);
    };

    return ToArraySubscriberFactory;
})(_SubscriberFactory3['default']);

function toArray() {
    return this.lift(new ToArraySubscriberFactory());
}

module.exports = exports['default'];
},{"../Subscriber":8,"../SubscriberFactory":9}],40:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = zip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function zip(observables, project) {
    return _Observable2['default'].zip([this].concat(observables), project);
}

module.exports = exports['default'];
},{"../Observable":4}],41:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = zipAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function zipAll(project) {
    return this.toArray().flatMap(function (observables) {
        return _Observable2['default'].zip(observables, project);
    });
}

module.exports = exports['default'];
},{"../Observable":4}],42:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Scheduler2 = require('./Scheduler');

var _Scheduler3 = _interopRequireDefault(_Scheduler2);

var _SchedulerActions = require('./SchedulerActions');

var NextTickScheduler = (function (_Scheduler) {
    function NextTickScheduler() {
        _classCallCheck(this, NextTickScheduler);

        _Scheduler.apply(this, arguments);
    }

    _inherits(NextTickScheduler, _Scheduler);

    NextTickScheduler.prototype.scheduleNow = function scheduleNow(state, work) {
        var action = this.scheduled ? new _SchedulerActions.ScheduledAction(this, state, work) : new _SchedulerActions.NextScheduledAction(this, state, work);
        action.schedule();
        return action;
    };

    return NextTickScheduler;
})(_Scheduler3['default']);

exports['default'] = NextTickScheduler;
module.exports = exports['default'];
},{"./Scheduler":43,"./SchedulerActions":44}],43:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SchedulerActions = require('./SchedulerActions');

var Scheduler = (function () {
    function Scheduler() {
        _classCallCheck(this, Scheduler);

        this.actions = [];
        this.active = false;
        this.scheduled = false;
    }

    Scheduler.prototype.schedule = function schedule(delay, state, work) {
        return delay <= 0 ? this.scheduleNow(state, work) : this.scheduleLater(state, work, delay);
    };

    Scheduler.prototype.flush = function flush() {
        if (!this.active) {
            this.active = true;
            var action;
            while (action = this.actions.shift()) {
                action.execute();
            }
            ;
            this.active = false;
        }
    };

    Scheduler.prototype.scheduleNow = function scheduleNow(state, work) {
        var action = new _SchedulerActions.ScheduledAction(this, state, work);
        action.schedule();
        return action;
    };

    Scheduler.prototype.scheduleLater = function scheduleLater(state, work, delay) {
        var action = new _SchedulerActions.FutureScheduledAction(this, state, work, delay);
        action.schedule();
        return action;
    };

    return Scheduler;
})();

exports['default'] = Scheduler;
module.exports = exports['default'];
},{"./SchedulerActions":44}],44:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _SerialSubscription2 = require('../SerialSubscription');

var _SerialSubscription3 = _interopRequireDefault(_SerialSubscription2);

var _utilImmediate = require('../util/Immediate');

var _utilImmediate2 = _interopRequireDefault(_utilImmediate);

var ScheduledAction = (function (_SerialSubscription) {
    function ScheduledAction(scheduler, state, work) {
        _classCallCheck(this, ScheduledAction);

        _SerialSubscription.call(this, null);
        this.scheduler = scheduler;
        this.work = work;
        this.state = state;
    }

    _inherits(ScheduledAction, _SerialSubscription);

    ScheduledAction.prototype.schedule = function schedule() {
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        actions.push(this);
        scheduler.flush();
        return this;
    };

    ScheduledAction.prototype.execute = function execute() {
        if (this.isUnsubscribed) {
            throw new Error('How did did we execute a canceled ScheduledAction?');
        }
        this.add(this.work(this.state));
    };

    ScheduledAction.prototype.unsubscribe = function unsubscribe() {
        _SerialSubscription.prototype.unsubscribe.call(this);
        var actions = this.scheduler.actions;
        var index = Array.isArray(actions) ? actions.indexOf(this) : -1;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        this.work = void 0;
        this.state = void 0;
        this.scheduler = void 0;
    };

    return ScheduledAction;
})(_SerialSubscription3['default']);

exports.ScheduledAction = ScheduledAction;

var NextScheduledAction = (function (_ScheduledAction) {
    function NextScheduledAction() {
        _classCallCheck(this, NextScheduledAction);

        _ScheduledAction.apply(this, arguments);
    }

    _inherits(NextScheduledAction, _ScheduledAction);

    NextScheduledAction.prototype.schedule = function schedule() {
        var self = this;
        var scheduler = this.scheduler;
        scheduler.actions.push(this);
        if (!scheduler.scheduled) {
            scheduler.active = true;
            scheduler.scheduled = true;
            this.id = _utilImmediate2['default'].setImmediate(function () {
                self.id = void 0;
                scheduler.active = false;
                scheduler.scheduled = false;
                scheduler.flush();
            });
        }
        return this;
    };

    NextScheduledAction.prototype.unsubscribe = function unsubscribe() {
        var scheduler = this.scheduler;
        if (scheduler.actions.length === 0) {
            scheduler.active = false;
            scheduler.scheduled = false;
            var id = this.id;
            if (id) {
                this.id = void 0;
                _utilImmediate2['default'].clearImmediate(id);
            }
        }
        _ScheduledAction.prototype.unsubscribe.call(this);
    };

    return NextScheduledAction;
})(ScheduledAction);

exports.NextScheduledAction = NextScheduledAction;

var FutureScheduledAction = (function (_ScheduledAction2) {
    function FutureScheduledAction(scheduler, state, work, delay) {
        _classCallCheck(this, FutureScheduledAction);

        _ScheduledAction2.call(this, scheduler, state, work);
        this.delay = delay;
    }

    _inherits(FutureScheduledAction, _ScheduledAction2);

    FutureScheduledAction.prototype.schedule = function schedule() {
        var self = this;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = undefined;
            clearTimeout(id);
        }
        var scheduleAction = _ScheduledAction2.prototype.schedule;
        this.id = setTimeout(function executeFutureAction() {
            self.id = void 0;
            scheduleAction.call(self, self.state);
        }, this.delay);
        return this;
    };

    FutureScheduledAction.prototype.unsubscribe = function unsubscribe() {
        var id = this.id;
        if (id != null) {
            this.id = void 0;
            clearTimeout(id);
        }
        _ScheduledAction2.prototype.unsubscribe.call(this);
    };

    return FutureScheduledAction;
})(ScheduledAction);

exports.FutureScheduledAction = FutureScheduledAction;
},{"../SerialSubscription":6,"../util/Immediate":47}],45:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Scheduler = require('./Scheduler');

var _Scheduler2 = _interopRequireDefault(_Scheduler);

var immediate = new _Scheduler2['default']();
exports['default'] = immediate;
module.exports = exports['default'];
},{"./Scheduler":43}],46:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _NextTickScheduler = require('./NextTickScheduler');

var _NextTickScheduler2 = _interopRequireDefault(_NextTickScheduler);

var nextTick = new _NextTickScheduler2['default']();
exports['default'] = nextTick;
module.exports = exports['default'];
},{"./NextTickScheduler":42}],47:[function(require,module,exports){
/**
All credit for this helper goes to http://github.com/YuzuJS/setImmediate
*/
"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _root = require("./root");

var _root2 = _interopRequireDefault(_root);

var Immediate = {};
if (_root2["default"] && _root2["default"].setImmediate) {
    Immediate.setImmediate = _root2["default"].setImmediate;
    Immediate.clearImmediate = _root2["default"].clearImmediate;
} else {
    Immediate = (function (global, Immediate) {
        var nextHandle = 1,
            tasksByHandle = {},
            currentlyRunningATask = false,
            doc = global.document,
            setImmediate;
        // Don't get fooled by e.g. browserify environments.
        if (({}).toString.call(global.process) === "[object process]") {
            // For Node.js before 0.9
            setImmediate = installNextTickImplementation();
        } else if (canUsePostMessage()) {
            // For non-IE10 modern browsers
            setImmediate = installPostMessageImplementation();
        } else if (global.MessageChannel) {
            // For web workers, where supported
            setImmediate = installMessageChannelImplementation();
        } else if (doc && "onreadystatechange" in doc.createElement("script")) {
            // For IE 6–8
            setImmediate = installReadyStateChangeImplementation();
        } else {
            // For older browsers
            setImmediate = installSetTimeoutImplementation();
        }
        Immediate.setImmediate = setImmediate;
        Immediate.clearImmediate = clearImmediate;
        return Immediate;
        function clearImmediate(handle) {
            delete tasksByHandle[handle];
        }
        function addFromSetImmediateArguments(args) {
            tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
            return nextHandle++;
        }
        // This function accepts the same arguments as setImmediate, but
        // returns a function that requires no arguments.
        function partiallyApplied(handler) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return function () {
                if (typeof handler === "function") {
                    handler.apply(undefined, args);
                } else {
                    new Function("" + handler)();
                }
            };
        }
        function runIfPresent(handle) {
            // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
            // So if we're currently running a task, we'll need to delay this invocation.
            if (currentlyRunningATask) {
                // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                // "too much recursion" error.
                setTimeout(partiallyApplied(runIfPresent, handle), 0);
            } else {
                var task = tasksByHandle[handle];
                if (task) {
                    currentlyRunningATask = true;
                    try {
                        task();
                    } finally {
                        clearImmediate(handle);
                        currentlyRunningATask = false;
                    }
                }
            }
        }
        function installNextTickImplementation() {
            return function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                global.process.nextTick(partiallyApplied(runIfPresent, handle));
                return handle;
            };
        }
        function canUsePostMessage() {
            // The test against `importScripts` prevents this implementation from being installed inside a web worker,
            // where `global.postMessage` means something completely different and can't be used for this purpose.
            if (global.postMessage && !global.importScripts) {
                var postMessageIsAsynchronous = true;
                var oldOnMessage = global.onmessage;
                global.onmessage = function () {
                    postMessageIsAsynchronous = false;
                };
                global.postMessage("", "*");
                global.onmessage = oldOnMessage;
                return postMessageIsAsynchronous;
            }
        }
        function installPostMessageImplementation() {
            // Installs an event handler on `global` for the `message` event: see
            // * https://developer.mozilla.org/en/DOM/window.postMessage
            // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
            var messagePrefix = "setImmediate$" + Math.random() + "$";
            var onGlobalMessage = function onGlobalMessage(event) {
                if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                    runIfPresent(+event.data.slice(messagePrefix.length));
                }
            };
            if (global.addEventListener) {
                global.addEventListener("message", onGlobalMessage, false);
            } else {
                global.attachEvent("onmessage", onGlobalMessage);
            }
            return function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                global.postMessage(messagePrefix + handle, "*");
                return handle;
            };
        }
        function installMessageChannelImplementation() {
            var channel = new MessageChannel();
            channel.port1.onmessage = function (event) {
                var handle = event.data;
                runIfPresent(handle);
            };
            return function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                channel.port2.postMessage(handle);
                return handle;
            };
        }
        function installReadyStateChangeImplementation() {
            var html = doc.documentElement;
            return function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                var script = doc.createElement("script");
                script.onreadystatechange = function () {
                    runIfPresent(handle);
                    script.onreadystatechange = null;
                    html.removeChild(script);
                    script = null;
                };
                html.appendChild(script);
                return handle;
            };
        }
        function installSetTimeoutImplementation() {
            return function setImmediate() {
                var handle = addFromSetImmediateArguments(arguments);
                setTimeout(partiallyApplied(runIfPresent, handle), 0);
                return handle;
            };
        }
    })(_root2["default"], Immediate);
}
exports["default"] = Immediate;
module.exports = exports["default"];
},{"./root":51}],48:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

if (!_root2['default'].Symbol) {
    _root2['default'].Symbol = {};
}
if (!_root2['default'].Symbol.observer) {
    if (typeof _root2['default'].Symbol['for'] === 'function') {
        _root2['default'].Symbol.observer = _root2['default'].Symbol['for']('observer');
    } else {
        _root2['default'].Symbol.observer = '@@observer';
    }
}
exports['default'] = _root2['default'].Symbol.observer;
module.exports = exports['default'];
},{"./root":51}],49:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = arraySlice;
var isArray = Array.isArray;

function arraySlice(array) {
    var index = arguments[1] === undefined ? 0 : arguments[1];

    if (isArray(array) === false) {
        return array;
    }
    var i = -1;
    var n = Math.max(array.length - index, 0);
    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = array[i + index];
    }
    return array2;
}

;
module.exports = exports["default"];
},{}],50:[function(require,module,exports){
"use strict";

exports.__esModule = true;
var errorObject = { e: {} };
exports["default"] = errorObject;
module.exports = exports["default"];
},{}],51:[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;
var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
};
var root = objectTypes[typeof window] && window || undefined,
    freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
    freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
    moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
    freeGlobal = objectTypes[typeof global] && global;
if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
}
exports['default'] = root;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],52:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = tryCatch;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _errorObject = require('./errorObject');

var _errorObject2 = _interopRequireDefault(_errorObject);

var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    } catch (e) {
        _errorObject2['default'].e = e;
        return _errorObject2['default'];
    }
}

function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}

;
module.exports = exports['default'];
},{"./errorObject":50}],53:[function(require,module,exports){
(function (global){
(function (root, factory) {
  root.RxNext = factory();
}(window || global || this, function(){
  return require('../dist/cjs/RxNext');	
}));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../dist/cjs/RxNext":5}]},{},[53]);
