/**
 * Everything in this file is generated by the 'tools/generate-operator-patches.ts' script.
 * Any manual edits to this file will be lost next time the script is run.
 **/
import {Observable} from '../../Observable';
import {pluck} from '../../operator/pluck';

Observable.prototype.pluck = pluck;

export var _void: void;