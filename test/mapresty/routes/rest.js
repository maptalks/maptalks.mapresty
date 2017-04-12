'use strict';

var express = require('express');
var router = express.Router();

router.post('/sdb/databases/:db/layers/:layer/data', function (req, res) {
    var features = [];
    for (var i = 0; i < 10; i++) {
        features.push({
            'type' : 'Feature',
            'geometry' : {
                'type' : 'Point',
                'coordinates' : [100 + Math.random() * 10, 50 + Math.random() * 10]
            },
            'properties' : {
                'foo' :' test'
            }
        });
    }
    var response = {
        'success'   : true,
        'count'     : 100,
        'data'      : [
            {
                'type' : 'FeatureCollection',
                'layer' : req.params.layer,
                'features' : features
            }
        ]
    };
    res.send(response);
});

router.post('/geometry/relation', function (req, res) {
    res.send({
        'success'   : true,
        'count'     : 2,
        'data'      : [1, 1]
    });
});

module.exports = router;
