export interface ParseResultColumn {
	name: string;
	originalName?: string;
	type: string;
	debug: {};
}

export interface ParseResult {
	data: any[];
	headers: ParseResultColumn[];
}

export interface IOptions {
	columnDelimiter: string;
	rowDelimiter: string;
	firstLineHeaders: boolean;
	convertNull: boolean;
	convertEmptyString: boolean;
	escapeSingleQuotes: boolean;
	trimFields: boolean;
	ignoreEmptyLines: boolean;
	outputType: string;
}

export interface IStats {}

export interface IState {
	input: string;
	acc: ParseResult;
	output: string;
	options: IOptions;
	stats: IStats;
}
