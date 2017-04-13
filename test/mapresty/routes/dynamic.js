const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const PNGImage = require('pngjs-image');

const generateId = obj => {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(obj));
    const id = hash.digest('hex');
    return id;
};

const router = express.Router();

router.use(bodyParser());

router.post('/maps', (req, res) => {
    const ct = req.header('Content-Type');
    if (!ct || !ct.match(/application\/json/)) {
        res.status(422);
        return;
    }
    const mapConfig = req.body;
    const token = generateId(mapConfig);
    res.status(200);
    res.send({ token });
});

router.get('/maps/:token/:z/:x/:y.:format', (req, res) => {
    res.type(req.params.format);
    const image = PNGImage.createImage(256, 256);
    for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
            image.setAt(x, y, { red: 255, green: 0, blue: 0 });
        }
    }
    res.send(image);
});

module.exports = router;
