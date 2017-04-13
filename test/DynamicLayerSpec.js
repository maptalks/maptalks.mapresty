describe('DynamicLayer', () => {
    let container;
    let map;
    const coords = [121.359403, 31.232223];
    const center = new maptalks.Coordinate(coords);

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
            'urlTemplate' : 'http://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            'subdomains'  : ['01', '02', '03', '04']
        });
        map.setBaseLayer(tile);
    });

    afterEach(() => {
        map.remove();
        // document.body.innerHTML = '';
    });

    it('can get tile from server side', done => {
        const dynamic = new maptalks.DynamicLayer('d', {
            baseUrl: 'http://localhost:8090/dynamic/maps',
        });
        dynamic.once('layerload', () => {
            done();
        });
        map.addLayer(dynamic);
    });
});
