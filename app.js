'use strict';
const config = require('./config');
const app = require('./lib/endpoints');
const https = require('https');
const fs = require('fs');

/**
 * Naming:
 * sid: Group of files
 * key: File
 * fid: {sid}++{key}
 */

let server;
if(config.port) {
  // HTTP Server
  server = app.listen(process.env.PORT || config.port, config.iface, () => {
    console.log(`PsiTransfer listening on http://${config.iface}:${config.port}`);
  });
}

let httpsServer;
if(config.sslPort && config.sslKeyFile && config.sslCertFile) {
  // HTTPS Server
  const sslOpts = {
    key: fs.readFileSync(config.sslKeyFile),
    cert: fs.readFileSync(config.sslCertFile)
  };
  httpsServer = https.createServer(sslOpts, app)
    .listen(config.sslPort, config.iface, () => {
      console.log(`PsiTransfer listening on https://${config.iface}:${config.sslPort}`);
    });
}


// graceful shutdown
function shutdown() {
  console.log('PsiTransfer shutting down...');
  if(server) {
    server.close(() => {
      server = false;
      if(!server && !httpsServer) process.exit(0);
    });
  }
  if(httpsServer) {
    httpsServer.close(() => {
      httpsServer = false;
      if(!server && !httpsServer) process.exit(0);
    });
  }
  setTimeout(function() {
    console.log('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 60 * 1000);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
