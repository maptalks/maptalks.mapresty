const http = require('http');

const port = require('./config').port;

http.get('http://localhost:' + port + 'shutdown');

