/* eslint-env mocha */

describe('DynamicLayer', function () {

    var container;
    var map;
    var p1 = [110.582514, 27.87486003];
    var p2 = [110.6846798, 28.00622502];
    var c = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    c = [121.359403, 31.232223];
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
            // urlTemplate: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
            // subdomains: ['a', 'b', 'c']
            'urlTemplate' : 'http://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            'subdomains'  : ['01','02','03','04'],
        });
        map.setBaseLayer(tile);
    });

    afterEach(function () {
        // document.body.innerHTML = '';
    });

    it('layer-type-maptalks', function () {
        var file = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgaGVpZ2h0PSI0NiIgd2lkdGg9IjMyIiB2aWV3Qm94PSIwIDAgMTYgMjMiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiID48ZGVmcz48L2RlZnM+IDxwYXRoICBmaWxsPSIjREUzMzMzIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTggMjNsMCAwIDAgMCAwIDAgMCAwIDAgMGMtNCwtNSAtOCwtMTAgLTgsLTE0IDAsLTUgNCwtOSA4LC05bDAgMCAwIDBjNCwwIDgsNCA4LDkgMCw0IC00LDkgLTgsMTR6IE01LDkgYTMsMyAwLDEsMCwwLC0wLjlaIj48L3BhdGg+IDwvc3ZnPg==';
        file = 'D:\\projects\\maptalks.js\\assets\\images\\control\\2.png';
        var style = [{
            markerWidth: {
                stops: [
                    [8, 0],
                    [9, 15],
                    [13, 20],
                    [15, 25],
                    [17, 30]
                ]
            },
            markerHeight: {
                stops: [
                    [8, 0],
                    [9, 18],
                    [13, 24],
                    [15, 30],
                    [17, 36]
                ]
            },
            markerDx: 0,
            markerDy: {
                stops: [
                    [8, 0],
                    [9, -9],
                    [13, -12],
                    [15, -15],
                    [17, -18]
                ]
            },
            opacity: 1,
            markerLineColor: '#4E98DD',
            markerLineWidth: 0,
            markerLineOpacity: 0.9,
            markerFillColor: '#4E98DD',
            markerFillOpacity: 0.9,
            // markerFile: file
            markerType: 'x'
        }/*, {
            textName: '{F3}',
            textFaceName: '"microsoft yahei", arial, sans-serif',
            textSize: 12,
            textFill: '#FFFFFF',
            textOpacity: 1,
            textSpacing: 1,
            textLineSpacing: 4,
            textAllowOverlap: true,
            textHorizontalAlignment: 'middle',
            textVerticalAlignment: 'middle',
            textHaloFill: '#4E98DD',
            textHaloRadius: 4,
            textDy: 5
        }*/];
        var dynamic = new maptalks.DynamicLayer('d', {
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
