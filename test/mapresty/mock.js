'use strict';

const express = require('express');
const rest = require('./routes/rest.js');
const snap = require('./routes/snap.js');

const app = express();

// view engine setup
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.use('/rest', rest);
app.use('/snap', snap);

module.exports = app;
