import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import morgan from 'morgan';
import net from 'net';

const NODE_ENV = process.env.NODE_ENV;
const app = express();

// Servers
let wdmServer;
let tcpServer;
let httpServer;
let httpsServer;
let TARGET_PORT = process.env.PORT || 0;
let HTTP_PORT = process.env.HTTP_PORT || 0;
let HTTPS_PORT = process.env.HTTPS_PORT || 0;

// Log requests
app.use(morgan('combined'))

if ('development' === NODE_ENV) { 
  const config = require('../../webpack/client').default;
  const compiler = webpack(config);

  wdmServer = webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: config.stats
  });

  app.use(wdmServer);
  app.use(webpackHotMiddleware(compiler));
}
else {
  const publicDir = path.resolve(__dirname, 'client');
  app.use(express.static(publicDir));
}

export function start() {
  return new Promise((resolve, reject) => {
    tcpServer = net.createServer(handleTCPConnection);
    httpServer = http.createServer(handleHTTPRequest);
    httpsServer = https.createServer(getSSLOptions(), app);

    Promise.all([
      startServer(tcpServer, TARGET_PORT),
      startServer(httpServer, HTTP_PORT),
      startServer(httpsServer, HTTPS_PORT)
    ])
    .then((servers) => {
      console.log('All servers started.');
      TARGET_PORT = servers[0].address().port;
      HTTP_PORT = servers[1].address().port;
      HTTPS_PORT = servers[2].address().port;

      console.log('TARGET_PORT', TARGET_PORT);
      console.log('HTTP_PORT', HTTP_PORT);
      console.log('HTTPS_PORT', HTTPS_PORT);

      resolve({
        protocol: 'https',
        ...servers[0].address()
      });
    })
    .catch((errors) => {
      console.error(arguments);
      reject(errors);
    })

    process.on('exit', () => {
      reject();
      handleExit.call(null, 'exit');
    });
    process.on('SIGINT', handleExit.bind(null, 'SIGINT'));
    process.on('SIGTERM', handleExit.bind(null, 'SIGTERM'));
    process.on('uncaughtException', handleExit.bind(null, 'uncaughtException'));
  });
}

// Just redirects to HTTPS
function handleHTTPRequest(req, res) {
  var secureUrl = "https://" + req.headers['host'] + req.url; 
  res.writeHead(301, { "Location":  secureUrl });
  res.end();
}

function getSSLOptions() {
  return {
    key:    fs.readFileSync(path.resolve(__dirname, 'ssl/server.key')),
    cert:   fs.readFileSync(path.resolve(__dirname, 'ssl/server.crt')),
    ca:     fs.readFileSync(path.resolve(__dirname, 'ssl/rootCA.crt')),
    requestCert:        true,
    rejectUnauthorized: false
  }
}

function handleTCPConnection(conn) {
  conn.once('data', function (buf) {
      // A TLS handshake record starts with byte 22.
      var address = (buf[0] === 22) ? HTTPS_PORT : HTTP_PORT;
      var proxy = net.createConnection(address, function () {
          proxy.write(buf);
          conn.pipe(proxy).pipe(conn);
      });
  });
}

function startServer(server, port) {
  return new Promise((resolve, reject) => {
    server.listen(port, 'localhost', (err) => {
      if (err) return reject(err);
      console.log('Server is listening', server.address());
      resolve(server);
    })
  })
}

function closeServer(server) {
  return new Promise((resolve) => {
    if (server && server.close) {
      server.close(() => {
        resolve();
      })
    } else {
      resolve();
    }
  })
}

function handleExit() {
  console.log('Stopping server..', ...arguments);

  Promise.all([
    closeServer(wdmServer),
    closeServer(tcpServer),
    closeServer(httpServer),
    closeServer(httpsServer),
  ])
  .catch((err) => {
    console.error(err);
    process.exit(0);
  });
  process.exit(0);
}

export default {
  start
}
