'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rest = require('./routes/rest.js');
const snap = require('./routes/snap.js');
const dynamic = require('./routes/dynamic');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/rest', rest);
app.use('/snap', snap);
app.use('/dynamic', dynamic);

module.exports = app;
