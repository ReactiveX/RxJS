///<reference path='../../typings/main.d.ts'/>
///<reference path='ambient.d.ts'/>

import * as _ from 'lodash';
import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import * as mocha from 'mocha';
import * as Suite from 'mocha/lib/suite';
import * as Test from 'mocha/lib/test';
import * as commonInterface from 'mocha/lib/interfaces/common';
import * as escapeRe from 'escape-string-regexp';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

//setup sinon-chai
chai.use(sinonChai);

declare const module: any;
declare const global: any;

const diagramFunction = global.asDiagram;

//mocha creates own global context per each test suite, simple patching to global won't deliver its context into test cases.
//this custom interface is just mimic of existing one amending test scheduler behavior previously test-helper does via global patching.
module.exports = (<any>mocha).interfaces['testscheduler-ui'] = function(suite) {
  const suites = [suite];

  suite.on('pre-require', function(context, file, mocha) {
    const common = (<any>commonInterface)(suites, context);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);
    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function(title, fn) {
      const suite = (<any>Suite).create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
      const suite = (<any>Suite).create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn) {
      const suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    context.type = function () {
      //intentionally does not execute to avoid unexpected side effect occurs by subscription,
      //or infinite source. Suffecient to check build time only.
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    function stringify(x): string {
      return JSON.stringify(x, function (key, value) {
        if (Array.isArray(value)) {
          return '[' + value
            .map(function (i) {
              return '\n\t' + stringify(i);
            }) + '\n]';
        }
        return value;
      })
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .replace(/\\n/g, '\n');
    }

    /**
     * custom assertion formatter for expectObservable test
     */
    function observableMatcher(actual, expected) {
      if (Array.isArray(actual) && Array.isArray(expected)) {
        const passed = _.isEqual(actual, expected);
        if (passed) {
          return;
        }

        let message = '\nExpected \n';
        actual.forEach((x) => message += `\t${stringify(x)}\n`);

        message += '\t\nto deep equal \n';
        expected.forEach((x) => message += `\t${stringify(x)}\n`);

        chai.assert(passed, message);
      } else {
        chai.assert.deepEqual(actual, expected);
      }
    }

    const it = context.it = context.specify = function(title, fn) {
      global.rxTestScheduler = null;
      let modified = fn;

      if (fn && fn.length === 0) {
        modified = function (done: MochaDone) {
          global.rxTestScheduler = new Rx.TestScheduler(observableMatcher);
          let error: any = null;

          try {
            fn();
            global.rxTestScheduler.flush();
          } catch (e) {
            error = e;
          } finally {
            global.rxTestScheduler = null;
            error ? done(error) : done();
          }
        };
      }

      const suite = suites[0];
      if (suite.pending) {
        modified = null;
      }
      const test = new (<any>Test)(title, modified);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    context.asDiagram = function (label) {
      if (diagramFunction) {
        return diagramFunction(label, it);
      }
      return it;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn) {
      const test = it(title, fn);
      const reString = '^' + (<any>escapeRe)(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function(title) {
      context.it(title);
    };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function(n) {
      context.retries(n);
    };
  });
};

//overrides JSON.toStringfy to serialize error object
Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    const alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      if (key !== 'stack') {
        alt[key] = this[key];
      }
    }, this);
    return alt;
  },
  configurable: true
});