export interface EnthusiasmState {
	languageName: string;
	enthusiasmLevel: number;
}

export interface Page1DOptions {
	inputDelimiter: string;
	outputDelimiter: string;
	distinctValues: 'FALSE' | 'DISTINCT' | 'DISTINCT-CASE-INSENSITIVE';
    sort: 'FALSE' | 'NUMERIC' | 'TEXT' | 'TEXT-CASE-INSENSITIVE';
    sortDirection: 'ASC' | 'DESC';
    quoteValues: boolean;
    trimValues: boolean;
}

export interface Page1DStatsKs {
	avg: number,
    min: number,
    k99gt: number,
    k95gt: number,
    k90gt: number,
    k75gt: number,
    k50: number,
    k75lt: number,
    k90lt: number,
    k95lt: number,
    k99lt: number,
    max: number,
    sum: number,
    variance: number,
    stddev: number,
    mode: number,
}

export type CountItem = {
	item: string;
	count: number;
}

export interface Page1DStats {
    inputCount: number,
    outputCount: number,
    isAllNumeric: boolean,
    ks: Page1DStatsKs
    acc: number[],
	counts: CountItem[]
}


export interface Page1DState {
	input: string;
	acc: string[];
	output: string;
	options: Page1DOptions;
	stats: Page1DStats;
}


export interface ParseResultColumn {
	name: string;
	originalName?: string;
	type: string;
	debug: {}
}

export interface ParseResult {
	data: any[];
	headers: ParseResultColumn[];
}


export interface Page2DOptions {
	columnDelimiter: string;
	rowDelimiter: string;
	firstLineHeaders: boolean;
	convertNull: boolean;
	convertEmptyString: boolean;
	outputType: string;
}

export interface Page2DStats {

}


export interface Page2DState {
	input: string;
	acc: ParseResult;
	output: string;
	options: Page2DOptions;
	stats: Page2DStats;

}

export interface StoreState {
	enthusiasm: EnthusiasmState;
	page1D: Page1DState;
	page2D: Page2DState;
}



