'use strict';

const express = require('express');
const router = express.Router();

router.post('/sdb/databases/:db/layers/:layer/data', function (req, res) {
    const features = [];
    for (let i = 0; i < 10; i++) {
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
    const response = {
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
