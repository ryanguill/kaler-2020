// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, cache, entry, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject.parcelRequire === 'function' &&
    globalObject.parcelRequire;
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  globalObject.parcelRequire = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"d77be6de51c4a74785e55b2b12df6da1":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_ENV_HASH = "d751713988987e9331980363e24189ce";
module.bundle.HMR_BUNDLE_ID = "e42c4448d7fd3be9f85a9f3922078dac";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH */

var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept, acceptedAssets; // eslint-disable-next-line no-redeclare

var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
  var port = HMR_PORT || location.port;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    acceptedAssets = {};
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      // Remove error overlay if there is one
      removeErrorOverlay();
      let assets = data.assets.filter(asset => asset.envHash === HMR_ENV_HASH); // Handle HMR Update

      var handled = false;
      assets.forEach(asset => {
        var didAccept = asset.type === 'css' || hmrAcceptCheck(global.parcelRequire, asset.id);

        if (didAccept) {
          handled = true;
        }
      });

      if (handled) {
        console.clear();
        assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });

        for (var i = 0; i < assetsToAccept.length; i++) {
          var id = assetsToAccept[i][1];

          if (!acceptedAssets[id]) {
            hmrAcceptRun(assetsToAccept[i][0], id);
          }
        }
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'error') {
      // Log parcel errors to console
      for (let ansiDiagnostic of data.diagnostics.ansi) {
        let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
        console.error('🚨 [parcel]: ' + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
      } // Render the fancy html overlay


      removeErrorOverlay();
      var overlay = createErrorOverlay(data.diagnostics.html);
      document.body.appendChild(overlay);
    }
  };

  ws.onerror = function (e) {
    console.error(e.message);
  };

  ws.onclose = function (e) {
    console.warn('[parcel] 🚨 Connection to the HMR server was lost');
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
    console.log('[parcel] ✨ Error resolved');
  }
}

function createErrorOverlay(diagnostics) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';

  for (let diagnostic of diagnostics) {
    let stack = diagnostic.codeframe ? diagnostic.codeframe : diagnostic.stack;
    errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>
          ${stack}
        </pre>
        <div>
          ${diagnostic.hints.map(hint => '<div>' + hint + '</div>').join('')}
        </div>
      </div>
    `;
  }

  errorHTML += '</div>';
  overlay.innerHTML = errorHTML;
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push([bundle, k]);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    if (link.parentNode !== null) {
      link.parentNode.removeChild(link);
    }
  };

  newLink.setAttribute('href', link.getAttribute('href').split('?')[0] + '?' + Date.now());
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      var absolute = /^https?:\/\//i.test(links[i].getAttribute('href'));

      if (!absolute) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    if (asset.type === 'css') {
      reloadCSS();
    } else {
      var fn = new Function('require', 'module', 'exports', asset.output);
      modules[asset.id] = [fn, asset.depsByBundle[bundle.HMR_BUNDLE_ID]];
    }
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (v) {
    return hmrAcceptCheck(v[0], v[1]);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached && cached.hot) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      var assetsToAlsoAccept = cb(function () {
        return getParents(global.parcelRequire, id);
      });

      if (assetsToAlsoAccept && assetsToAccept.length) {
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
      }
    });
  }

  acceptedAssets[id] = true;
}
},{}],"8ff988b981d62ba0f5af31d8720616e2":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.doTransform = doTransform;
exports.determineColumnDelimiter = determineColumnDelimiter;
const version = '0.1-20200707';
const defaultState = {
  input: '',
  acc: {
    data: [],
    headers: []
  },
  output: '',
  options: {
    columnDelimiter: `\\t`,
    rowDelimiter: `\\n`,
    convertNull: true,
    firstLineHeaders: false,
    convertEmptyString: true,
    escapeSingleQuotes: true,
    trimFields: true,
    ignoreEmptyLines: true,
    outputType: 'PGValues'
  },
  stats: {}
};

(function () {
  applySettings(defaultState.options);
  document.getElementById('input-textarea').addEventListener('keyup', function (event) {
    render();
  });
  document.querySelectorAll('.setting-input').forEach(function (element) {
    element.addEventListener('keyup', render);
  });
  document.querySelectorAll('.setting-checkbox, .setting-select').forEach(function (element) {
    element.addEventListener('change', render);
  });
  document.getElementById('reset-settings').addEventListener('click', () => applySettings(defaultState.options));
  document.getElementById('version').innerText = version;
})();

function applySettings(options) {
  document.getElementById('column-delimiter').value = options.columnDelimiter;
  document.getElementById('row-delimiter').value = options.rowDelimiter;
  document.getElementById('convert-null').checked = options.convertNull;
  document.getElementById('first-line-headers').checked = options.firstLineHeaders;
  document.getElementById('convert-empty-string').checked = options.convertEmptyString;
  document.getElementById('escape-single-quotes').checked = options.escapeSingleQuotes;
  document.getElementById('trim-fields').checked = options.trimFields;
  document.getElementById('ignore-empty-lines').checked = options.ignoreEmptyLines;
  document.getElementById('output-type').value = options.outputType;
}

function render() {
  //get all of the option values and the input
  const input = { ...defaultState,
    input: document.getElementById('input-textarea').value,
    options: {
      columnDelimiter: document.getElementById('column-delimiter').value,
      rowDelimiter: document.getElementById('row-delimiter').value,
      convertNull: document.getElementById('convert-null').checked,
      firstLineHeaders: document.getElementById('first-line-headers').checked,
      convertEmptyString: document.getElementById('convert-empty-string').checked,
      escapeSingleQuotes: document.getElementById('escape-single-quotes').checked,
      trimFields: document.getElementById('trim-fields').checked,
      ignoreEmptyLines: document.getElementById('ignore-empty-lines').checked,
      outputType: document.getElementById('output-type').value
    }
  };
  const output = doTransform(input);
  document.getElementById('output-textarea').value = output.output;
}

function mapObject(input, fn) {
  return Object.entries(input).map(function ([key, value]) {
    return fn(value, key);
  });
}

function processDelimiter(delim) {
  return delim.replace(/\\r\\n/gm, '\r\n').replace(/\\n/gm, '\n').replace(/\\t/gm, '\t');
}

function doTransform(input) {
  return parse(input);
}

function parse(input) {
  const { ...state
  } = input;
  state.acc = parseInput(state.input, state.options);

  switch (state.options.outputType) {
    case 'debug':
      state.output = JSON.stringify(state.acc, null, 2);
      break;

    case 'PGInserts':
      state.output = toPgInsert(state.acc, 'tablename');
      break;

    case 'PGValues':
      state.output = toPGValues(state.acc, 'data');
      break;

    default:
      state.output = JSON.stringify(state.acc.data, null, 2);
      break;
  }

  return state;
}

function sanitizeColumnName(input) {
  return input.replace(/[^A-Z0-9/-_\s]/gi, '').replace(/\s/, '_');
}

function determineColumnDelimiter(input, config) {
  //assume that the rowDelimiter is set properly
  const rows = input.split(processDelimiter(config.rowDelimiter)); //look at each row and count the occurrance of expected possible delimiters

  const expectedPossibleDelimiters = [`,`, `\t`];
  const counts = new Map();

  for (const row of rows) {
    for (const delim of expectedPossibleDelimiters) {
      const currentValue = counts.get(delim) ?? 0;
      counts.set(delim, currentValue + (row.trim().split(delim).length - 1));
    }
  }

  const bestColumnDelimiter = Object.keys(counts).reduce(function (a, b) {
    return (counts.get(a) ?? 0) > (counts.get(b) ?? 0) ? a : b;
  });

  if (bestColumnDelimiter === `\t`) {
    return `\\t`;
  }

  return bestColumnDelimiter;
}

function excelColumnNameForIndex(idx) {
  let output = '';

  for (let a = 1, b = 26; (idx -= a) >= 0; a = b, b *= 26) {
    output = String.fromCharCode(idx % b / a + 65) + output;
  }

  return output;
}

function isZeroPaddedString(input) {
  const chars = input.split('');
  return chars[0] === '0' && chars.length > 1;
}

function determineBestDataTypeForColumn(input, column) {
  //slice out just that one columns worth of data
  const data = input.map(row => row[column.name]).filter(cell => cell !== null); //remove nulls so it doesn't skew results
  //possible datatypes: varchar | numeric | datetime | boolean

  if (data.length === 0) {
    column.type = 'varchar';
    return column;
  }

  const possibleBooleanValues = [true, false, 'TRUE', 'FALSE', 'true', 'false', 'yes', 'no', 'YES', 'NO'];

  if (data.every(cell => possibleBooleanValues.includes(cell))) {
    column.type = 'boolean';
    return column;
  } //use a regex to see if there are only digits


  if (data.every(cell => /^-*[0-9\.]+$/.test(cell) && !isZeroPaddedString(cell))) {
    column.type = 'numeric';
    return column;
  } else {
    column.debug['notNumeric'] = data.filter(cell => !/^-*[0-9\.]+$/.test(cell));
  }
  /*
  const possibleDateFormats = [moment.ISO_8601, 'MM/DD/YYYY', 'YYYY-MM-DD'];
  //if the value matches a date format
  if (data.every(cell => moment(cell, possibleDateFormats, true).isValid())) {
  	column.type = 'datetime';
  	return column;
  }
  */


  column.type = 'varchar';
  return column;
}

function parseInput(input, config) {
  //todo: need to fix this `any` - but chances are it means I need a different variable down below
  let output = input.split(processDelimiter(config.rowDelimiter)).filter(function (line) {
    if (config.ignoreEmptyLines && line.trim().length === 0) {
      return false;
    } else {
      return true;
    }
  }).map(function (line) {
    return line.split(processDelimiter(config.columnDelimiter));
  });
  let headerNames = [];

  if (config.firstLineHeaders) {
    headerNames = output.shift() || [];
  } //get the longest array


  const longestRow = output.reduce((agg, row) => Math.max(agg, row.length), 0);

  if (headerNames.length < longestRow) {
    //const excelHeaders :string []; _.times(longestRow, (idx) => headerNames.push(excelColumnNameForIndex(idx + 1)));
    for (let idx = headerNames.length; idx < longestRow; idx++) {
      headerNames.push(excelColumnNameForIndex(idx + 1));
    }
  }

  let headers = headerNames.map(header => ({
    name: sanitizeColumnName(header),
    originalName: header,
    type: 'varchar',
    debug: {}
  }));
  output = output.map(function (row) {
    const rowObj = {};
    row.forEach(function (cell, idx) {
      if (config.convertEmptyString && typeof cell === 'string' && cell.toUpperCase() === 'EMPTYSTRING') {
        cell = '';
      } else if (config.convertNull && typeof cell === 'string' && cell.toUpperCase() === 'NULL') {
        cell = null;
      }

      if (cell !== null && typeof cell === 'string' && config.trimFields) {
        cell = cell.trim();
      }

      if (cell !== null && typeof cell === 'string' && config.escapeSingleQuotes) {
        cell = cell.split(`'`).join(`''`);
      }

      rowObj[headers[idx].name] = cell;
    });
    return rowObj;
  });
  headers = headers.map(header => determineBestDataTypeForColumn(output, header)); //now that we have the real headers, go through them and convert the data if necessary

  output = output.map(function (row) {
    return Object.entries(row).map(function ([key, value]) {
      const header = headers.find(h => h.name === key);

      if (header === undefined) {
        //should never happen but have to handle the possibility
        return value;
      }

      if (value === null) {
        return value;
      }

      if (header.type === 'boolean') {
        if ([true, 1, '1', 'true', 'TRUE'].includes(value)) {
          return true;
        }

        return false;
      }

      if (header.type === 'numeric') {
        return Number(value);
      }

      if (header.type === 'datetime') {
        //return moment.utc(value).toDate();
        //todo
        return value;
      }

      return value;
    });
  });
  return {
    data: output,
    headers
  };
}

function toPgInsert(input, tableName = 'tableName') {
  function rowTemplate(row, columns) {
    let output = `(`;
    output += mapObject(row, (value, key) => {
      const col = columns.find(column => column.name = key);

      if (col === undefined) {
        //should never happen but have to protect against it
        return value;
      } //console.log({col, key, value});


      if (value === null) {
        return `NULL`;
      }

      if (col.type === 'boolean') {
        if (value) {
          return `TRUE`;
        } else {
          return `FALSE`;
        }
      }

      if (['numeric'].includes(col.type)) {
        return value;
      }

      if (['datetime'].includes(col.type)) {
        //return `'${moment.utc(value).toISOString()}'`;
        //todo
        return value;
      }

      return `'${value}'`;
    }).join(', ');
    return output + ')';
  }

  function columnTemplate(column) {
    let type = column.type;

    if (type === 'datetime') {
      type = 'timestamptz';
    }

    return `${column.name} ${type}`;
  }

  return `DROP TABLE IF EXISTS ${tableName} CASCADE;
CREATE TABLE ${tableName} (
	 ${input.headers.map(header => {
    return ` ${columnTemplate(header)}`;
  }).join('\n\t,')}
);

INSERT INTO ${tableName} ( ${input.headers.map(header => header.name).join(', ')} ) VALUES
  ${input.data.map(row => rowTemplate(row, input.headers)).join('\n, ')}
;`;
}

function toPGValues(input, cteName = 'data') {
  function rowTemplate(row, columns) {
    let output = `(`;
    output += mapObject(row, (value, key) => {
      const col = columns.find(column => column.name = key);

      if (col === undefined) {
        //should never happen but have to protect against it
        return value;
      } //console.log({col, key, value});


      if (value === null) {
        return `NULL`;
      }

      if (col.type === 'boolean') {
        if (value) {
          return `TRUE`;
        } else {
          return `FALSE`;
        }
      }

      if (['numeric'].includes(col.type)) {
        return value;
      }

      if (['datetime'].includes(col.type)) {
        //return `'${moment.utc(value).toISOString()}'`;
        return value;
      }

      return `'${value}'`;
    }).join(', ');
    return output + ')';
  }

  return `with ${cteName} (${input.headers.map(header => header.name).join(',')}) as (VALUES
  ${input.data.map(row => rowTemplate(row, input.headers)).join('\n, ')}
)
SELECT
	*
FROM
	${cteName};`;
}
/*
 ===============================================================================
 UNIT TESTS - only runs when unit testing
 ===============================================================================

 if (process.argv.length > 1 && process.argv[1].includes('mocha')) {

 let expect = chai.expect;
 let assert = chai.assert;

 suite(__filename.split('/').reverse()[0] + ' tests', function () {

 test('parseInput', async function () {
 const input = `a	b	c	d	e	f
 1	a	January	2001-01-01	TRUE	1
 2	b	February	2002-01-01	FALSE	2
 3	c	March	2003-01-01	1	3
 4	d	April	2004-01-01	0	4
 5	e	May	2005-01-01	true	5
 6	f	June	2006-01-01	false	6
 7	g	July	2007-01-01	TRUE	7
 8	h	August	2008-01-01	FALSE	8
 9	i	September	2009-01-01	TRUE	9
 10	j	October	2010-01-01	FALSE	10
 11	k	November	2011-01-01	TRUE	a`;

 const output = parseInput(input, {
 firstLineHeaders: true,
 convertNull: true,
 convertEmptyString: true
 });

 expect(output).to.be.an('object');
 expect(output).to.have.keys(['data','headers']);
 expect(output.data).to.be.an('array');
 expect(output.data).to.have.lengthOf(11);
 expect(output.headers).to.be.an('array').to.have.lengthOf(6);
 expect(_.map(output.headers, 'name')).to.deep.equal(['a','b','c','d','e','f']);

 //console.log(util.inspect(output));

 //console.log(toPgInsert(output));

 });

 test('parseInput_emptystring', async function () {
 const input = `a	b	c	d	e	f
 1	a	January	2001-01-01	TRUE	1
 2	b	emptystring	2002-01-01	FALSE	2
 3	c		2003-01-01	1	3`;

 const output = parseInput(input, {
 firstLineHeaders: true,
 convertNull: true,
 convertEmptyString: true
 });

 expect(output.data[1].c).to.equal('');
 expect(output.data[2].c).to.equal('');
 });

 test('parseInput_null', async function () {
 const input = `a	b	c	d	e	f
 null	a	January	2001-01-01	TRUE	1
 2	b	null	2002-01-01	FALSE	2
 3	c		null	1	3`;

 const output = parseInput(input, {
 firstLineHeaders: true,
 convertNull: true,
 convertEmptyString: true
 });

 //console.log(util.inspect(output));
 //console.log(toPgInsert(output));


 expect(output.data[0].a).to.equal(null);
 expect(output.data[1].c).to.equal(null);
 expect(output.data[2].d).to.equal(null);
 });

 test('excel-columns', async function () {
 const input = `1	2	3	4	5	6	7	8	9	10`;

 const output = parseInput(input, {
 firstLineHeaders: false,
 convertNull: false,
 convertEmptyString: false
 });

 //console.log(util.inspect(output));
 //console.log(toPgInsert(output));

 expect(_.map(output.headers, 'name')).to.deep.equal(['A','B','C','D','E','F','G','H','I','J']);
 });

 test('excel-columns-filler', async function () {
 const input = `a	b	c	d	e	f
 1	2	3	4	5	6	7	8	9	10`;

 const output = parseInput(input, {
 firstLineHeaders: true,
 convertNull: false,
 convertEmptyString: false
 });

 expect(_.map(output.headers, 'name')).to.deep.equal(['a','b','c','d','e','f','G','H','I','J']);
 });


 });
 }
 */
},{}]},{},["d77be6de51c4a74785e55b2b12df6da1","8ff988b981d62ba0f5af31d8720616e2"], null)

//# sourceMappingURL=main.e42c4448.js.map
