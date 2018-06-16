import * as Http from 'http';
import * as WebSocket from 'ws';
import { Server as WsServer } from 'ws';
import { AddressInfo } from 'net';

import { CallSession } from './session';

function indexPage(response: Http.ServerResponse): void {
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
function media(url: string, response: Http.ServerResponse): void {
	response.statusCode = 404;
	response.statusMessage = 'No Media Supported';
	response.end();
}
function handleCall(request: Http.IncomingMessage, response: Http.ServerResponse): void {
	const url = request.url;
	const sessionCut = url.indexOf('/', 1);
	const sessionNumber = +url.substr(1, sessionCut - 1);
	const session = sessions.find(s => s.id === sessionNumber);
	if (session) {
		return session.handleCall(request, response);
	}
}

function listener(request: Http.IncomingMessage, response: Http.ServerResponse): void {
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
		response.statusMessage = 'returning Data';
		response.end('OK');
		return;
	}
	switch (request.url) {
		case '/':
			return indexPage(response);
		case '/favicon.ico':
			return media(request.url, response);
	}

	if (request.url.match(/^\/[0-9]{1,}\//)) {
		return handleCall(request, response);
	}

	console.log(request.url);
	response.statusCode = 403;
	response.statusMessage = 'WHAT!?';
	response.write('');
	response.end();
}


const server = Http.createServer(listener);
const wss = new WsServer({server});
const sessions = [] as Array<CallSession>;

wss.on('connection', (socket: WebSocket) => {
	sessions.push(new CallSession(socket));
});

server.listen(8111, () => {
	console.log(`Server started on port ${(server.address() as AddressInfo).port}`);
});

