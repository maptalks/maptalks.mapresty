/* eslint-env mocha */

describe('DynamicLayer', function () {

    var container;
    var map;
    var center = new maptalks.Coordinate(118.846825, 32.046534);

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '256px';
        container.style.height = '256px';
        document.body.appendChild(container);
        var option = {
            center: center,
            zoom: 14
        };
        map = new maptalks.Map(container, option);
        var tile = new maptalks.TileLayer('tile', {
            urlTemplate: '/resources/tile.png',
            subdomains: [1, 2, 3]
        });
        map.setBaseLayer(tile);
    });

    afterEach(function () {
        // document.body.innerHTML = '';
    });

    it('test', function () {
        var dynamic = new maptalks.DynamicLayer('d', {
            baseUrl: 'http://localhost:11216/map',
            mapdb: 'sdb',
            layers: [{
                name: 'country_point',
                condition: '',
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
