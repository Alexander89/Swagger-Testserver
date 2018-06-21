import * as S from './models/swagger/swagger';
import { Logging } from './logging';
import { Session } from './session';
import { MessageLvl, EventTypes, CallData, ReturnSchema } from 'test-server';
import fetch from 'node-fetch';

export class SwaggerTestServer extends Logging {
	/** array of all pre-processed callData */
	private _calls = [] as Array<CallData>;

	constructor(private readonly session: Session) {
		super();
	}

	/**
	 * resolve all refs and set the compleat model into it.
	 * NOTE: increase the size of the data
	 * @param def swagger definition
	 */
	public static resolveRef(def: S.Root): S.Root {
		let strDef = JSON.stringify(def);
		const replaced = new Array<string>(); // for cycle detection

		// helper functions
		const trimObj = (json: string): string => {
			if (json.length < 2) {
				return '';
			}
			return json.substr(1, json.length - 2);
		};
		const getModelAsString = (name: string): string => {
			const model = def.definitions[name];
			if (!model) {
				throw new ReferenceError(`ref to undefined Model ${name}`);
			}
			return trimObj(JSON.stringify(model));
		};
		const getResponseAsString = (name: string): string => {
			const response = def.responses[name];
			if (!response) {
				throw new ReferenceError(`ref to undefined Responses ${name}`);
			}
			return trimObj(JSON.stringify(response));
		};
		const replaceAll = (placeHolder: string, replace: string): void => {
			if (replaced.indexOf(placeHolder) !== -1) {
				throw new SyntaxError(`STOP! A ref cycle is detected in ${placeHolder}`);
			}
			while (true) {
				if (strDef.indexOf(placeHolder) === -1) {
					return;
				}
				strDef = strDef.replace(placeHolder, replace);
			}
		};

		// task to replace $ref
		while (true) {
			const refPos = strDef.indexOf('"$ref"');
			if (refPos === -1) {
				break;
			}
			// fix positions in ref string
			const defPos = strDef.indexOf('#', refPos) + 2;
			const slashPos = strDef.indexOf('/', defPos);
			const modelPos = slashPos + 1;
			const endPos = strDef.indexOf('"', slashPos);

			// extract strings
			const refType = strDef.substr(defPos, slashPos - defPos);
			const name = strDef.substr(modelPos, endPos - modelPos);
			const fullRefString = strDef.substr(refPos, endPos + 1 - refPos); // +1 for the last "

			// replace with Model or response
			if (refType === 'definitions') {
				replaceAll(fullRefString, getModelAsString(name));
			} else if (refType === 'responses') {
				replaceAll(fullRefString, getResponseAsString(name));
			}
		}
		return JSON.parse(strDef);
	}

	/**
	 * extract the model name from the reference string. return always the text after the last /
	 * @param ref reference string to split the model name
	 */
	public static splitRef(ref: string): string {
		const split = ref.lastIndexOf('/') + 1;
		return ref.substr(split);
	}

	/**
	 * seth the path for the JSON definition file and fetch the data from this resource
	 * NOTE: using test data to ignore missing network
	 * @param path URL to request the JSON definition from
	 */
	public setPath(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				fetch(path).then(v => {
					if (!v.ok || v.status !== 200) {
						reject();
					}
					v.json().then(
						def => this.parseJson(def) ? resolve() : reject()
					).catch((e) => reject(e));
				}).catch((e) => reject(e));
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * parse the Definition and set all additional information to work as quick as possible with the data
	 * @param def definition object should be in S.Root structure.
	 */
	private parseJson(def: any): boolean {
		try {
			const SwaggerDef = SwaggerTestServer.resolveRef(def as S.Root);
			Object.getOwnPropertyNames(SwaggerDef.paths).forEach(call => {
				Object.getOwnPropertyNames(SwaggerDef.paths[call]).forEach(method => {
					this._calls.push(this.preparedCall(SwaggerDef, method, call));
				});
			});
			// console.log(JSON.stringify(this._calls, null, 4));
			return true;
		} catch (e) {
			return false;
		}
	}
	/**
	 * convert a call into a CallData object and set the response data and ...
	 * @param method method of the call
	 * @param callName Call definition name to pick it up from the object
	 */
	private preparedCall(def: S.Root, method: string, callName: string): CallData {
		const call = def.paths[callName][method];

		const availableResponses = Object.getOwnPropertyNames(call.responses);

		const returnStructures = {} as {[returnState: string]: ReturnSchema};
		availableResponses.forEach(
			resp => returnStructures[resp] = this.createReturnStructure('', call.responses[resp].schema)
		);

		return {
			callName,
			method,
			call,
			jsonData: {
				availableResponses,
				selectedResponse: availableResponses[0],
				returnStructures
			},
			id: this._calls.length,
		};
	}

	/**
	 * interpret a schema and set the sub schemas to control it for the replies
	 * @param name name of the parameter
	 * @param schema schema to interpret
	 * @param required is this property required in the parent
	 */
	private createReturnStructure(name: string, schema: S.Schema, required: boolean = true): ReturnSchema {
		if (!schema) {
			return undefined;
		}
		const rSchema = {
			name,
			type: schema.type,
			example: schema.example,
			required,
			present: true
		} as ReturnSchema;

		switch (schema.type) {
			case 'boolean':
			case 'integer':
			case 'number':
			case 'float':
			case 'string':
				break;
			case 'object':
				rSchema.objectSchema = Object.getOwnPropertyNames(schema.properties).map(p => {
					const requiredProperty = schema.required ? schema.required.indexOf(p) !== -1 : false;
					return this.createReturnStructure(p, schema.properties[p], requiredProperty);
				});
				break;
			case 'array':
				rSchema.arraySchema = [this.createReturnStructure('Array', schema.items, false)];
				break;
		}
		return rSchema;
	}

	/**
	 * add a message to the session log and send ist out over the socket
	 * @param text text to log
	 * @param type Level of interest for this log message
	 * @param from info who is responsive for this message / error
	 */
	public logMessage(text: string, type: MessageLvl, from: EventTypes = 'server'): void {
		this.addMessage(text, type);
		this.session.log(text, type, from);
		return;
	}

	/**
	 * get all calls as CallData
	 */
	public getCalls(): Array<CallData> {
		return this._calls;
	}
}


