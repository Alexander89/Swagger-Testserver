import { MessageLvl } from 'test-server';
export class LogEntry {
	private _timeStamp: Date;
	constructor(private readonly _text: string, private readonly _type: MessageLvl) {
		this._timeStamp = new Date();
	}
	toString() {
		return `${this._timeStamp.toLocaleTimeString()}: ${this._type} - ${this._text};`;
	}
}

export class Logging {
	private _logs = [] as Array<LogEntry>;

	protected addMessage(text: string, type: MessageLvl) {
		// tslint:disable-next-line:no-console
		console.log(type + ': ' + text);
		this._logs.push(new LogEntry(text, type));
	}
}
