import * as Http from 'http';
import * as WebSocket from 'ws';
import * as mySQL from 'mySQL';

import { Server as WsServer } from 'ws';
import { AddressInfo } from 'net';

import { CallSession, Session } from './session';
import { CallData } from 'test-server';

if (true) {
	process.env.DB_Type = process.env.DB_Type || 'mySQL';
	process.env.DB_Host = process.env.DB_Host || '127.0.0.1';
	process.env.DB_Username = process.env.DB_Username || 'root';
	process.env.DB_Password = process.env.DB_Password || 'root';
	process.env.DB_Database = (process.env.DB_Database || 'swaggerTest').toLowerCase();
}

export class ApiServer {
	private server: Http.Server;
	private wss: WsServer;
	private sessions: Array<CallSession>;
	private storage: DbStorage;

	constructor() {
		this.server = Http.createServer((request: Http.IncomingMessage, response: Http.ServerResponse) => this.listener(request, response));
		this.wss = new WsServer({server: this.server});
		this.sessions = [];

		this.wss.on('connection', (socket: WebSocket) => {
			this.sessions.push(new CallSession(socket));
		});

		this.server.listen(8111, () => {
			console.log(`Server started on port ${(this.server.address() as AddressInfo).port}`);
			this.storage = new DbStorage(this);
		});
	}

	getSession(name: string): CallSession {
		return this.sessions.find(s => s.id === name);
	}

	private indexPage(response: Http.ServerResponse): void {
		response.statusCode = 200;
		response.statusMessage = 'Return Data';
		response.end(`
			<h1>Don't use this as Webpage.</h1>
			<p>
				it is only for web calls defined in your definition
				<a href="https://github.com/Alexander89/Swagger-Validator" target="new">
					(Swagger-Validator / https://github.com/Alexander89/Swagger-Validator)
				</a>
			</p>
		`);
	}
	private media(url: string, response: Http.ServerResponse): void {
		response.statusCode = 404;
		response.statusMessage = 'No Media Supported';
		response.end();
	}
	private handleCall(request: Http.IncomingMessage, response: Http.ServerResponse): void {
		const url = request.url;
		const sessionCut = url.indexOf('/', 1);
		const sessionName = url.substr(1, sessionCut - 1);
		const session = this.getSession(sessionName);
		if (session) {
			return session.handleCall(request, response);
		}
	}

	private listener(request: Http.IncomingMessage, response: Http.ServerResponse): void {
		if (!request.url || !request.method) {
			return response.end();
		}
		response.setHeader('access-control-allow-headers', '*');
		response.setHeader('access-control-allow-methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
		response.setHeader('access-control-allow-origin', '*');
		response.setHeader('cache-control', 'no-cache, private');
		response.setHeader('content-type', 'text/html; charset=UTF-8');
		response.setHeader('server', 'Swagger-TestServer');

		if (request.method === 'OPTIONS') {
			response.statusCode = 200;
			response.statusMessage = 'returning Options';
			response.end('OK');
			return;
		}
		switch (request.url) {
			case '/':
				return this.indexPage(response);
			case '/favicon.ico':
				return this.media(request.url, response);
		}

		if (request.url.match(/^\/[a-zA-Z0-9]{1,}\//)) {
			return this.handleCall(request, response);
		}

		console.log(request.url);
		response.statusCode = 403;
		response.statusMessage = 'Unknowns Request';
		response.end('WHAT!?');
	}
}



export class DbStorage {
	private _enable: boolean;
	private _ready = false;
	private _mySQLConnection: mySQL.Connection;

	constructor(private readonly apiServer: ApiServer) {
		(global as any).db = this;
		this._enable = (process.env.DB_Type === 'mySQL' &&
			process.env.DB_Host !== undefined &&
			process.env.DB_Username !== undefined &&
			process.env.DB_Password !== undefined &&
			process.env.DB_Database !== undefined);

		console.log('db is ' + this._enable);
		if (!this._enable) {
			return;
		}
		if (process.env.DB_Type === 'mySQL') {
			this._mySQLConnection = mySQL.createConnection({
				host: process.env.DB_Host,
				user: process.env.DB_Username,
				password: process.env.DB_Password,
			});

			this._mySQLConnection.connect(() => {
				console.log('connected');
				this._ready = true;
				this.createDatabase();
				this.readExistingSessions();
			});
			this._mySQLConnection.on('error', (err) => {
				console.log(err.message);
			});
		}
	}

	addSession(session: Session): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this._ready) {
				return;
			}

			this._mySQLConnection.query(
				`INSERT INTO st_sessions (sessionName, calls) VALUES ('${session.id}', '${JSON.stringify((session as any)._sTS._calls)}');`,
				(e) => {
					if (e) {
						reject(e.message);
					} else {
						resolve();
					}
				}
			);
		});
	}

	updateSession(session: Session): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this._ready) {
				return;
			}

			this._mySQLConnection.query(
				`UPDATE st_sessions SET calls='${JSON.stringify((session as any)._sTS._calls)}' WHERE sessionName=${session.id};`,
				(e) => {
					if (e) {
						reject(e.message);
					} else {
						resolve();
					}
				}
			);
		});
	}

	createDatabase() {
		if (!this._ready) {
			return;
		}
		console.log('createDatabase');
		if (process.env.DB_Type === 'mySQL') {
			this._mySQLConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_Database};`, (error) => {
				console.log('CREATE DATABASE' + error);
			});
			this._mySQLConnection.query(`USE ${process.env.DB_Database};`, (error) => {
				console.log('DATABASE ' + error);
			});
			this._mySQLConnection.query(
				`CREATE TABLE st_sessions (
					id INT(11) unsigned NOT NULL AUTO_INCREMENT,
					sessionName VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
					calls LONGTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
					deleted INT(1) unsigned NOT NULL DEFAULT 0,
					created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
					lastChange DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					PRIMARY KEY (id)
				  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`,
				(error) => {
					console.log('CREATE TABLE' + error);
				}
			);
		}
	}

	readExistingSessions() {
		if (!this._ready) {
			return;
		}

		if (process.env.DB_Type === 'mySQL') {
			this._mySQLConnection.query('select sessionName, calls from st_Sessions where deleted = false', (err: mySQL.MysqlError | null, results) => {
				if (err) {
					console.log('mySql error: ' + err.message);
					return;
				}

				(results as Array<{sessionName: string, calls: string}>).forEach(row => {
					const newSession = new CallSession(undefined) as any;
					newSession._id = row.sessionName;
					newSession._sTS._calls = JSON.parse(row.calls) as Array<CallData>;
					(this.apiServer as any).sessions.push(newSession);
				});
			});
		}
	}
}

export const server = new ApiServer();
