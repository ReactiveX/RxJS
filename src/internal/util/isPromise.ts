/**
 * Tests to see if the object is an ES2015 (ES6) Promise
 * @see {@link https://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects}
 * @param value the object to test
 */
export function isPromise<T = any>(value: any): value is PromiseLike<T> {
  return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}
