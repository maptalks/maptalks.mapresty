/* eslint-env mocha */

describe('DynamicLayer', function () {

    var container;
    var map;
    var p1 = [110.582514, 27.87486003];
    var p2 = [110.6846798, 28.00622502];
    var c = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    var center = new maptalks.Coordinate(c);

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '512px';
        container.style.height = '512px';
        document.body.appendChild(container);
        var option = {
            center: center,
            zoom: 9
        };
        map = new maptalks.Map(container, option);
        var tile = new maptalks.TileLayer('tile', {
            renderer: 'dom',
            urlTemplate: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c']
        });
        map.setBaseLayer(tile);
    });

    afterEach(function () {
        // document.body.innerHTML = '';
    });

    it('test', function () {
        var dynamic = new maptalks.DynamicLayer('d', {
            renderer: 'dom',
            baseUrl: 'http://localhost:11216/map',
            mapdb: 'pg92_chinamap_maptalks',
            // resultCRS: maptalks.CRS.createProj4('+proj=longlat +datum=GCJ02'),
            resultCRS: 'GCJ02',
            layers: [{
                name: 'country_point',
                condition: 'name like \'%乡\'',
                fields: ['name', 'kind'],
                style: {
                    'filter': ['==', '$type', 'Point'],
                    'symbol': {
                        'markerFile': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgaGVpZ2h0PSI0NiIgd2lkdGg9IjMyIiB2aWV3Qm94PSIwIDAgMTYgMjMiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiID48ZGVmcz48L2RlZnM+IDxwYXRoICBmaWxsPSIjREUzMzMzIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTggMjNsMCAwIDAgMCAwIDAgMCAwIDAgMGMtNCwtNSAtOCwtMTAgLTgsLTE0IDAsLTUgNCwtOSA4LC05bDAgMCAwIDBjNCwwIDgsNCA4LDkgMCw0IC00LDkgLTgsMTR6IE01LDkgYTMsMyAwLDEsMCwwLC0wLjlaIj48L3BhdGg+IDwvc3ZnPg=='
                    }
                }
            }]
        });
        map.addLayer(dynamic);
    });

});
