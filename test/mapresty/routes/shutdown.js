var http = require('http'),
    port = require('./config').port;

http.get('http://localhost:' + port + 'shutdown');

