import * as Http from 'http';
import * as Api from 'test-server';
import * as WebSocket from 'ws';
import { SwaggerTestServer } from './swagger-test-server';
import { Data } from 'ws';
import { CallData, ReturnSchema } from 'test-server';
import * as S from './models/swagger/swagger';
import { isArray } from 'util';


export class Session {
	static sessionId = 0;
	private _id: number;
	protected _sTS = new SwaggerTestServer(this);

	constructor(private readonly socket: WebSocket) {
		this._id = Session.sessionId++;
		socket.on('message', data => this.onMessage(data));
		socket.send('o');
	}

	private onMessage(data: Data) {
		try {
			const call = JSON.parse(data.toString()) as Api.Command;
			switch (call.command) {
				case 'open': {
					this._sTS.setPath((call.data as Api.CommandOpen).path).then(() => {
						this.reply(call.command, 'ok', {sessionID: this._id});
						this._sTS.logMessage(`session opened with id ${this._id}`, 'info', 'client');
					}).catch(() => {
						this.reply(call.command, 'error');
					});
					break;
				}
				case 'close': {
					this.reply(call.command, 'ok');
					this._sTS.logMessage(`session closed from client`, 'info', 'client');
					this.socket.close();
					break;
				}
				case 'getCalls': {
					this.reply(call.command, 'ok', this._sTS.getCalls());
					break;
				}
				case 'getCallData':
				break;
				case 'updatePath':
				break;
				case 'updateCallData':
				break;
			}
		} catch (e) {
			this._sTS.logMessage(`unknown command ${e}`, 'error', 'client');
		}
	}

	public reply(command: Api.AvailableCommands, replyState: 'ok' | 'error' | undefined, data?: Api.AvailableDataTypes, eventType?: Api.EventTypes) {
		this.send({ command, eventType, data, replyState } as Api.Command);
	}

	public log(message: string, type: Api.MessageLvl = 'info', eventEmitter: Api.EventTypes = 'server') {
		this.send({
			command: 'event',
			eventType: eventEmitter,
			data: {
				timestamp: Date.now(),
				lvl: type,
				message: message
			} as Api.EventMessage
		} as Api.Command);
	}
	private send(reply: Api.Command): void {
		this.socket.send(JSON.stringify(reply));
	}

	get id(): number { return this._id; }
}

export class CallSession extends Session {
	constructor(socket: WebSocket) {
		super(socket);
	}

	public handleCall(request: Http.IncomingMessage, response: Http.ServerResponse): void {
		const url = request.url;
		const sessionCut = url.indexOf('/', 1);
		const query = url.substr(sessionCut);
		const call = this._sTS.getCalls().find(c =>
			c.method.toLocaleLowerCase() === request.method.toLocaleLowerCase() &&
			this.matchCallName(c.callName, query)
		);
		if (!call) {
			this._sTS.logMessage(`get request for unknown call ${request.method}: ${request.url}`, 'error', 'client');
			response.statusCode = 404;
			response.statusMessage = 'Definition Not Found';
			response.end();
			return;
		}
		return this.executeCall(call, request, response);
	}

	private matchCallName(callName: string, query: string): boolean {
		const callParts = query.split('?')[0].split('/');
		const definitionParts = callName.split('/');
		// check if both require the same length of parameter in the all
		if (definitionParts.length !== callParts.length) {
			return false;
		}
		// check if both have the same fixed values in the query
		return definitionParts.every((defined, index) => {
			if (defined.startsWith('{')) {
				return true;
			}
			return defined === callParts[index];
		});
	}

	private executeCall(callData: CallData, request: Http.IncomingMessage, response: Http.ServerResponse): void {
		this._sTS.logMessage(`Execute Call ${request.method}: ${callData.callName}`, 'info', 'client');
		// console.log(callData.call);
		const selectedResponse = +callData.jsonData.selectedResponse;
		const resp = callData.jsonData.returnStructures[selectedResponse];
		response.statusCode = selectedResponse;
		response.statusMessage = callData.call.responses[selectedResponse].description;

		if (callData.call.responses[selectedResponse].schema) {
			response.setHeader('content-type', 'application/json');
			response.write(JSON.stringify(this.createResponse(resp)));
		}
		return response.end();
	}

	private createResponse(schema: ReturnSchema | Array<ReturnSchema>): any {
		if (isArray(schema)) {
			const result = {} as any;
			schema.forEach(s => {
				if (s.present) {
					result[s.name] = this.createResponse(s);
				}
			});
			return result;
		} else if (schema.type === 'object') {
			return this.createResponse(schema.objectSchema);
		} else if (schema.type === 'array') {
			return schema.arraySchema.map(s => this.createResponse(s));
		} else {
			return schema.example ? schema.example : this.getDefaultExample(schema.type);
		}
	}

	/**
	 * generate a example value. this will be used, when no example is set from the Swagger-Validator
	 * @param type type to generate the example for
	 */
	private getDefaultExample(type: 'object' | 'array' | 'integer' | 'number' | 'string' | 'boolean' | 'float'): any {
		switch (type) {
			case 'integer':
				return 1;
			case 'number':
				return 1;
			case 'string':
				return 'example';
			case 'boolean':
				return true;
			case 'float':
				return 1.0;
			default:
				return 'undefined';
		}
	}
}
