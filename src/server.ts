import { spawn } from 'child_process';
import cryptoRandomString from 'crypto-random-string';
import * as http from 'http';
import parse from 'url-parse';
import * as WebSocket from 'ws';

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function handleMessage(ws: WebSocket, message: WebSocket.Data) {
  if (typeof message !== 'string') {
    return;
  }
  const { command, args = [] } = JSON.parse(message);
  if (!command || typeof command !== 'string') {
    return;
  }

  const process = spawn(command, args);

  function sendData(data: any) {
    ws.send(JSON.stringify(data));
  }

  const token = cryptoRandomString({ length: 24, type: 'url-safe' }) as string;

  process.stdout.on('data', (data) => {
    sendData({ stdoutMessage: data.toString(), token });
  });

  process.stderr.on('data', (data) => {
    sendData({ stderrMessage: data.toString(), token });
  });

  process.on('exit', (exitCode) => {
    sendData({ exitCode: exitCode || 0, token });
  });
}

const { AUTHORIZATION } = process.env;
if (!AUTHORIZATION) {
  throw new Error('Missing AUTHORIZATION env var');
}

wss.on('connection', (ws: WebSocket, req) => {
  const { url } = req;
  if (!url) {
    ws.close();
    return;
  }
  const {
    query: { authorization },
  } = parse(url, true);

  if (authorization !== process.env.AUTHORIZATION) {
    ws.close();
    return;
  }

  ws.on('message', (message) => {
    try {
      handleMessage(ws, message);
    } catch (e) {
      console.error(e);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port || 3000, () => {
  console.log(`Server started on port ${port} :)`);
});