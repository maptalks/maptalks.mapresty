'use strict';

describe.skip('YUMQuery', function () {
    const host = 'localhost';
    const port = 8090;
    const mapdb = 'file';
    //yum 的验证测试
    it('无锡PH街道测试', function () {
        const spatialFilter = new maptalks.SpatialFilter(
            new maptalks.Rectangle([116.32026326838199, 39.865799426134345], 10, 10),
            maptalks.SpatialFilter.RELATION_WITHIN
            );
        const featureQuery = new maptalks.FeatureQuery({
            'host' : host,
            'port' : port,
            'mapdb': mapdb
        });
        featureQuery.query({
            'page' : 0,
            'count': 20,
            'layer'     : 'layer_using_shapefile',
            'queryFilter':{
                'returnGeometry' : true,
                'spatialFilter' : spatialFilter, /*{
                     'geometry' : new maptalks.Circle([121.26456223614285,31.561616130735995],10).toGeoJSONGeometry(),
                     'relation' : maptalks.SpatialFilter.RELATION_WITHIN
                },*/
                // 'condition': "city='163431c5629a4b47a7e33a6fd907c3b5'",
                'resultCRS':maptalks.CRS.BD09LL
                //'condition' : '1=1',
                //'resultFields' : ['field1','field2'] //'*'表示返回全部
            },
            'success'   : function (geos) {
                expect(geos.length).to.be(1);
                expect(geos[0].features.length).to.be.above(0);
                console.log(JSON.stringify(geos[0].features));
            },
            'error' : function (error) {
                console.error(error);
            }
        });
    });
});
