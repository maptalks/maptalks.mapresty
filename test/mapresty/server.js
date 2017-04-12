'use strict';

/**
 * Module dependencies.
 */
const app = require('./mock'),
    http = require('http'),
    port = require('./config').port;

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Get port from environment and store in Express.
 */
app.set('port', port);

app.get('/stop', function () {
    server.close();
});

/**
 * Listen on provided port, on specified network interfaces.
 */

const addr = 'localhost';

server.listen(port, addr);
