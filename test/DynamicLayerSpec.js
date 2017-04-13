const http = require('http');
const express = require('express');
const router = require('./mapresty/routes/dynamic');

describe('DynamicLayer', () => {
    let server;
    let container;
    let map;
    const coords = [121.359403, 31.232223];
    const center = new maptalks.Coordinate(coords);

    before(() => {
        const app = express();
        app.use(router);
        server = http.createServer(app);
        server.listen(0);
    });

    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '512px';
        container.style.height = '512px';
        document.body.appendChild(container);
        const option = {
            center: center,
            zoom: 9
        };
        map = new maptalks.Map(container, option);
        const tile = new maptalks.TileLayer('tile', {
            // urlTemplate: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
            // subdomains: ['a', 'b', 'c']
            'urlTemplate' : 'http://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            'subdomains'  : ['01', '02', '03', '04']
        });
        map.setBaseLayer(tile);
    });

    afterEach(() => {
        // document.body.innerHTML = '';
    });

    after(() => {
        server.close();
    });

    it('can get tile from server side', () => {
        const port = server.address().port;
        const dynamic = new maptalks.DynamicLayer('d', {
            baseUrl: `http://localhost:${port}/maps`,
        });
        map.addLayer(dynamic);
    });
});
