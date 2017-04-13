const crypto = require('crypto');
const express = require('express');
const PNGImage = require('pngjs-image');

const generateId = obj => {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(obj));
    const id = hash.digest('hex');
    return id;
};

const router = express.Router();

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
    image.fillRect(0, 0, 100, 100, { red: 255, green: 0, blue: 0 });
    res.send(image.toBlobSync());
});

module.exports = router;
