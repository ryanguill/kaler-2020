import { IState, ParseResult, ParseResultColumn, IOptions } from './types';

const version: string = '0.1-20200707';

const defaultState: IState = {
	input: '',
	acc: {
		data: [],
		headers: [],
	},
	output: '',
	options: {
		columnDelimiter: `\\t`,
		rowDelimiter: `\\n`,
		convertNull: true,
		firstLineHeaders: true,
		convertEmptyString: true,
		escapeSingleQuotes: true,
		trimFields: false,
		ignoreEmptyLines: true,
		outputType: 'PGValues',
	},
	stats: {},
};

(function() {
	applySettings(defaultState.options);

	document
		.getElementById('input-textarea')!
		.addEventListener('keyup', function(event) {
			render();
		});

	document.querySelectorAll('.setting-input').forEach(function(element) {
		element.addEventListener('keyup', render);
	});
	document
		.querySelectorAll('.setting-checkbox, .setting-select')
		.forEach(function(element) {
			element.addEventListener('change', render);
		});

	document
		.getElementById('reset-settings')!
		.addEventListener('click', () => applySettings(defaultState.options));

	document.getElementById('version')!.innerText = version;
})();

function applySettings(options: IOptions) {
	(<HTMLInputElement>document.getElementById('column-delimiter')).value =
		options.columnDelimiter;
	(<HTMLInputElement>document.getElementById('row-delimiter')).value =
		options.rowDelimiter;
	(<HTMLInputElement>document.getElementById('convert-null')).checked =
		options.convertNull;
	(<HTMLInputElement>document.getElementById('first-line-headers')).checked =
		options.firstLineHeaders;
	(<HTMLInputElement>(
		document.getElementById('convert-empty-string')
	)).checked = options.convertEmptyString;
	(<HTMLInputElement>(
		document.getElementById('escape-single-quotes')
	)).checked = options.escapeSingleQuotes;
	(<HTMLInputElement>document.getElementById('trim-fields')).checked =
		options.trimFields;
	(<HTMLInputElement>document.getElementById('ignore-empty-lines')).checked =
		options.ignoreEmptyLines;
	(<HTMLSelectElement>document.getElementById('output-type')).value =
		options.outputType;
}

function render() {
	//get all of the option values and the input

	const input: IState = {
		...defaultState,
		input: (<HTMLTextAreaElement>document.getElementById('input-textarea'))
			.value,
		options: {
			columnDelimiter: (<HTMLInputElement>(
				document.getElementById('column-delimiter')
			)).value,
			rowDelimiter: (<HTMLInputElement>(
				document.getElementById('row-delimiter')
			)).value,
			convertNull: (<HTMLInputElement>(
				document.getElementById('convert-null')
			)).checked,
			firstLineHeaders: (<HTMLInputElement>(
				document.getElementById('first-line-headers')
			)).checked,
			convertEmptyString: (<HTMLInputElement>(
				document.getElementById('convert-empty-string')
			)).checked,
			escapeSingleQuotes: (<HTMLInputElement>(
				document.getElementById('escape-single-quotes')
			)).checked,
			trimFields: (<HTMLInputElement>(
				document.getElementById('trim-fields')
			)).checked,
			ignoreEmptyLines: (<HTMLInputElement>(
				document.getElementById('ignore-empty-lines')
			)).checked,
			outputType: (<HTMLSelectElement>(
				document.getElementById('output-type')
			)).value,
		},
	};

	const output = doTransform(input);
	(<HTMLTextAreaElement>document.getElementById('output-textarea')).value =
		output.output;
}

function mapObject (input: Object, fn: (value: unknown, key: string) => any) : any [] {
	return Object.entries(input).map(function ([key, value]) {

		return fn(value, key);
	});
}

function processDelimiter(delim: string): string {
	return delim
		.replace(/\\r\\n/gm, '\r\n')
		.replace(/\\n/gm, '\n')
		.replace(/\\t/gm, '\t');
}

export function doTransform(input: IState): IState {
	return parse(input);
}

function parse(input: IState): IState {
	const { ...state } = input;
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

function sanitizeColumnName(input: string): string {
	return input.replace(/[^A-Z0-9/-_\s]/gi, '').replace(/\s/, '_');
}

export function determineColumnDelimiter(
	input: string,
	config: IOptions
): string {
	//assume that the rowDelimiter is set properly
	const rows: string[] = input.split(processDelimiter(config.rowDelimiter));

	//look at each row and count the occurrance of expected possible delimiters
	const expectedPossibleDelimiters = [`,`, `\t`];
	const counts: Map<string, number> = new Map();

	for (const row of rows) {
		for (const delim of expectedPossibleDelimiters) {
			const currentValue = counts.get(delim) ?? 0;
			counts.set(
				delim,
				currentValue + (row.trim().split(delim).length - 1)
			);
		}
	}

	const bestColumnDelimiter = Object.keys(counts).reduce(function(
		a: string,
		b: string
	) {
		return (counts.get(a) ?? 0) > (counts.get(b) ?? 0) ? a : b;
	});
	if (bestColumnDelimiter === `\t`) {
		return `\\t`;
	}
	return bestColumnDelimiter;
}

function excelColumnNameForIndex(idx: number): string {
	let output = '';
	for (let a = 1, b = 26; (idx -= a) >= 0; a = b, b *= 26) {
		output = String.fromCharCode((idx % b) / a + 65) + output;
	}

	return output;
}

function isZeroPaddedString(input: string) {
	const chars = input.split('');
	return chars[0] === '0' && chars.length > 1;
}

function determineBestDataTypeForColumn(
	input: {}[],
	column: ParseResultColumn
): ParseResultColumn {
	//slice out just that one columns worth of data
	const data = input
		.map(row => row[column.name])
		.filter(cell => cell !== null); //remove nulls so it doesn't skew results

	//possible datatypes: varchar | numeric | datetime | boolean

	if (data.length === 0) {
		column.type = 'varchar';
		return column;
	}

	const possibleBooleanValues: (string | number | boolean)[] = [
		true,
		false,
		'TRUE',
		'FALSE',
		'true',
		'false',
		'yes',
		'no',
		'YES',
		'NO',
	];

	if (data.every(cell => possibleBooleanValues.includes(cell))) {
		column.type = 'boolean';
		return column;
	}

	//use a regex to see if there are only digits
	if (
		data.every(
			cell => /^-*[0-9\.]+$/.test(cell) && !isZeroPaddedString(cell)
		)
	) {
		column.type = 'numeric';
		return column;
	} else {
		column.debug['notNumeric'] = data.filter(
			cell => !/^-*[0-9\.]+$/.test(cell)
		);
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

function parseInput(input: String, config: IOptions): ParseResult {
	//todo: need to fix this `any` - but chances are it means I need a different variable down below
	let output: any[] = input
		.split(processDelimiter(config.rowDelimiter))
		.filter(function(line: string) {
			if (config.ignoreEmptyLines && line.trim().length === 0) {
				return false;
			} else {
				return true;
			}
		})
		.map(function(line: string): string[] {
			return line.split(processDelimiter(config.columnDelimiter));
		});

	let headerNames: string[] = [];
	if (config.firstLineHeaders) {
		headerNames = output.shift() || [];
	}
	//get the longest array
	const longestRow = output.reduce(
		(agg: number, row: string[]) => Math.max(agg, row.length),
		0
	);

	if (headerNames.length < longestRow) {
		//const excelHeaders :string []; _.times(longestRow, (idx) => headerNames.push(excelColumnNameForIndex(idx + 1)));
		for (let idx = headerNames.length; idx < longestRow; idx++) {
			headerNames.push(excelColumnNameForIndex(idx + 1));
		}
	}

	let headers = headerNames.map(
		(header: string): ParseResultColumn => ({
			name: sanitizeColumnName(header),
			originalName: header,
			type: 'varchar',
			debug: {},
		})
	);

	output = output.map(function(row: string[]) {
		const rowObj: any = {};
		row.forEach(function(cell: string | null, idx: number) {
			if (
				config.convertEmptyString &&
				typeof cell === 'string' &&
				cell.toUpperCase() === 'EMPTYSTRING'
			) {
				cell = '';
			} else if (
				config.convertNull &&
				typeof cell === 'string' &&
				cell.toUpperCase() === 'NULL'
			) {
				cell = null;
			}
			if (
				cell !== null &&
				typeof cell === 'string' &&
				config.trimFields
			) {
				cell = cell.trim();
			}
			if (
				cell !== null &&
				typeof cell === 'string' &&
				config.escapeSingleQuotes
			) {
				cell = cell.split(`'`).join(`''`);
			}
			rowObj[headers[idx].name] = cell;
		});
		return rowObj;
	});

	headers = headers.map(header =>
		determineBestDataTypeForColumn(output, header)
	);

	//now that we have the real headers, go through them and convert the data if necessary
	output = output.map(function(row: {}) {
		return Object.entries(row).map(function([key, value]) {
			const header = headers.find(h => h.name === key);
			if (header === undefined) {
				//should never happen but have to handle the possibility
				return value;
			}
			if (value === null) {
				return value;
			}
			if (header.type === 'boolean') {
				if ([true, 1, '1', 'true', 'TRUE'].includes(value as string | number | boolean)) {
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

	return { data: output, headers };
}

function toPgInsert(
	input: ParseResult,
	tableName: string = 'tableName'
): string {
	function rowTemplate(row: {}[], columns: ParseResultColumn[]): string {
		let output: string = `(`;

		output += mapObject(row, (value, key: string) => {
			const col = columns.find(column => column.name = key);
			if (col === undefined) {
				//should never happen but have to protect against it
				return value;
			}
			//console.log({col, key, value});

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

	function columnTemplate(column: ParseResultColumn): string {
		let type = column.type;
		if (type === 'datetime') {
			type = 'timestamptz';
		}

		return `${column.name} ${type}`;
	}

	return `DROP TABLE IF EXISTS ${tableName} CASCADE;
CREATE TABLE ${tableName} (
	 ${input.headers
			.map(header => {
				return ` ${columnTemplate(header)}`;
			})
			.join('\n\t,')}
);

INSERT INTO ${tableName} ( ${input.headers.map(header => header.name).join(', ')} ) VALUES
  ${input.data.map(row => rowTemplate(row, input.headers)).join('\n, ')}
;`;
}

function toPGValues(input: ParseResult, cteName: string = 'data'): string {
	function rowTemplate(row: {}[], columns: ParseResultColumn[]): string {
		let output: string = `(`;

		output += mapObject(row, (value, key: string) => {
			const col = columns.find(column => column.name = key);
			if (col === undefined) {
				//should never happen but have to protect against it
				return value;
			}
			//console.log({col, key, value});

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

	return `with ${cteName} (${input.headers.map(header => header.name).join(
		','
	)}) as (VALUES
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
