import Subscription from './Subscription';

export default class SerialSubscription extends Subscription {
  subscription:Subscription;
  
  constructor(subscription:Subscription) {
    super(null);
    this.subscription = subscription;
  }
  
  add(subscription:Subscription):Subscription {
    if(subscription) {
        if(this.unsubscribed) {
            subscription.unsubscribe();
        } else {
            var currentSubscription = this.subscription;
            this.subscription = subscription;
            if(currentSubscription) {
                currentSubscription.unsubscribe();
            }
        }
    }
    return <Subscription>this;
  }
  
  remove(subscription) {
    if(this.subscription === subscription) {
        this.subscription = undefined;
    }
    return this;
  }
  
  unsubscribe() {
    if(this.unsubscribed) { return; }
    this.unsubscribed = true;
    var subscription = this.subscription;
    if(subscription) {
        this.subscription = undefined;
        subscription.unsubscribe();
    }
  }
}