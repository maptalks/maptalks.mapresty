'use strict';

/**
 * Module dependencies.
 */
var app = require('./mock'),
    http = require('http'),
    port = require('./config').port;

/**
 * Get port from environment and store in Express.
 */
var server;
app.set('port', port);

app.get('/stop', function () {
    server.close();
});

/**
 * Create HTTP server.
 */

server = http.createServer(app);

/**
 * Listen on provided port, on specified network interfaces.
 */

var addr = 'localhost';

server.listen(port, addr);
