import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';

export class AsapScheduler extends AsyncScheduler {
  public flush(action?: AsyncAction<any>): void {

    this.active = true;
    this.scheduled = undefined;

    const {actions} = this;
    let error: any;
    let index = -1;
    action = action || actions.shift()!;
    const count = actions.length;

    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (++index < count && (action = actions.shift()));

    this.active = false;

    if (error) {
      while (++index < count && (action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}
