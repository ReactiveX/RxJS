var fs = require('fs');
var regex = /export interface CoreOperators\<T\> \{([\S|\s]*)\}/;

var content = fs.readFileSync('./src/CoreOperators.ts').toString();
var contentResult = content.match(regex)[1].trim();
var contents = contentResult.split('\n');
var extraSpaceRegex = /  /;

var operators = {};
var fileResult = 'import { Observable, ObservableOrIterable, ObservableOrPromise, ArrayOrIterable } from \'./Observable\';\nimport {Scheduler} from "./Scheduler";\nimport {Notification} from "./Notification";\nimport {Subject} from "./Subject";\nimport {Observer} from "./Observer";\nimport {GroupedObservable} from "./operators/groupBy-support";\nimport {GroupByObservable} from "./operators/groupby";\n\n';

for (var i = 0; i < contents.length; i++) {
  var item = contents[i].trim();
  if (item) {
    var file = item.match(/(.*?)\: operators.operator_proto_(.*?)\<T\>;/);
    if (!file) {
      console.log('item', item, 'file', file);
      continue;
    }

    var property = file[1].trim();
    var filename = file[2];
    var fileContent = fs.readFileSync('./src/operators/'+filename+'.ts').toString();

    var methods = [];

    var r = new RegExp('export function [_]?'+ filename +'([\\s|\\S]*?[\\;\\{])', 'g');
    do {
      var result = r.exec(fileContent);
      if (result) {
        console.log(result[0])
        var method = result[1].trim();

        console.log(method);
        if (methods.length > 0 && method.indexOf('{') > -1) {
          continue;
        }

        method = method.split(/\n/g)
          .filter(function(x) { return !!x })
          .map(function(x) { return (''+x).trim(); })
          .join(' ')
          .replace(/ = .*?([\,|\)])/g, '$1');

        if (method[method.length - 1] === ';' || method[method.length - 1] === '{') {
          method = method.substr(0, method.length - 1).trim();
        }

        method = method.replace(/^\<T\>/, '').replace(/^\<T, /, '<');
        methods.push(method);
      }
    } while(result);

    if (!operators[filename]) {
      operators[filename] = true;
      fileResult += 'export interface operator_proto_' + filename + '<T> {\n  ' + methods.join(';\n  ') + ';\n}\n';
    }
  }
}

fs.writeFileSync('./src/operator-typings.ts', fileResult);
