'use strict';

var express = require('express'),
    rest = require('./routes/rest.js'),
    snap = require('./routes/snap.js');

var app = express();

// view engine setup
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.use('/rest', rest);
app.use('/snap', snap);

module.exports = app;
