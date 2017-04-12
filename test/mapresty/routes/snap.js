'use strict';

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.send('snap service of maptalks.');
}).post('/', function (req, res) {
    console.log('[server] snap request received');
    parsePostData(req, function (data) {
        let response;
        if (Array.isArray(data)) {
            response = {
                'success'   : true,
                'file'      : {
                    'zip' : 'foo.zip',
                    'files' : ['foo1.png', 'foo2.png']
                }
            };
        } else {
            response = {
                'success' : true,
                'file'    : 'foo'
            };
        }
        res.send(response);
    });

});

function parsePostData(req, callback) {
    if (req.body && (req.body.profile || Array.isArray(req.body))) {
        callback(req.body);
    } else {
        let body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            const data = JSON.parse(body);
            callback(data);
        });
    }
}

module.exports = router;
