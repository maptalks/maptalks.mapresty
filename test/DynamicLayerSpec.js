/* eslint-env mocha */

describe('DynamicLayer', function () {

    let container;
    let map;
    const p1 = [110.582514, 27.87486003];
    const p2 = [110.6846798, 28.00622502];
    let c = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    c = [121.359403, 31.232223];
    const center = new maptalks.Coordinate(c);

    beforeEach(function () {
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

    afterEach(function () {
        // document.body.innerHTML = '';
    });

    it('layer-type-maptalks', function () {
        const dynamic = new maptalks.DynamicLayer('d', {
            baseUrl: 'http://localhost:11216/maps',
            mapdb: 'mysql_chinamap_maptalks',
            // resultCRS: maptalks.CRS.createProj4('+proj=longlat +datum=GCJ02'),
            resultCRS: 'GCJ02',
            layers: [{
                name: 'country_point',
                condition: 'name like \'%乡\'',
                fields: ['name', 'kind'],
                style: {
                    symbol: {
                        'markerType'   : 'ellipse',
                        'markerWidth'  : 4,
                        'markerHeight' : 4
                    }
                }
            }]
        });
        map.addLayer(dynamic);
    });
});
