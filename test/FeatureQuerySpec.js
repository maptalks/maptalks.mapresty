'use strict';

const maptalks = (typeof (window) !== 'undefined') ? window.maptalks : require('maptalks');
const expect = (typeof (window) !== 'undefined') ? window.expect : require('expect.js');

describe('FeatureQuery', function () {
    const host = 'localhost';
    const port = 11215;
    const mapdb = 'file';
    const layerId = 'layer_using_shapefile';
    describe('query', function () {
        it('no return geometry', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.query(
                {
                    'page' : 0,
                    'count': 20,
                    'layer'     : layerId,
                    'queryFilter':{
                        'returnGeometry' : false,
                        'resultCRS':maptalks.CRS.BD09LL
                    }
                },
            function (err, collections) {
                if (err) {
                    throw err;
                }
                expect(err === null);
                expect(collections.length === 1);
                expect(collections[0].features.length === 20);
                const features = collections[0].features;
                for (let i = features.length - 1; i >= 0; i--) {
                    expect(!(features instanceof maptalks.Geometry));
                    expect(!features[i].geometry);
                }
                done();
            }
            );
        });

        it('filter with condition', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.query(
                {
                    'page' : 0,
                    'count': 10,
                    'layer'     : layerId,
                    'queryFilter':{
                        'condition' : 'name === \'China\''
                    }
                },
                function (err, collections) {
                    if (err) {
                        throw err;
                    }
                    expect(collections.length === 1);
                    expect(collections[0].features.length === 1);
                    done();
                }
            );
        });

        it('return parts of fields', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.query(
                {
                    'page' : 0,
                    'count': 10,
                    'layer'     : layerId,
                    'queryFilter':{
                        'resultFields' : ['name']
                    }
                },
                function (err, collections) {
                    if (err) {
                        throw err;
                    }
                    const features = collections[0].features;
                    expect(features.length === 10);
                    for (let i = features.length - 1; i >= 0; i--) {
                        // console.log(expect(features[i].getProperties()));
                        expect(features[i].getProperties()).to.be.eql({ 'name':features[i].getProperties().name });
                    }
                    done();
                }
            );
        });

        it('can return no fields', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.query(
                {
                    'page' : 0,
                    'count': 10,
                    'layer'     : layerId,
                    'queryFilter':{
                        'resultFields' : [] //'*'表示返回全部
                    }
                },
                function (err, collections) {
                    if (err) {
                        throw err;
                    }
                    const features = collections[0].features;
                    expect(features.length === 10);
                    for (let i = features.length - 1; i >= 0; i--) {
                        expect(!features[i].getProperties());
                    }
                    done();
                }
            );
        });

        it('can filter by spatial filter', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.query(
                {
                    'page' : 0,
                    'count': 10,
                    'layer'     : layerId,
                    'queryFilter':{
                        'spatialFilter' : new maptalks.SpatialFilter(
                                                new maptalks.Circle([0, 0], 1),
                                                maptalks.SpatialFilter.RELATION_INTERSECT
                                                )
                    }
                },
                function (err, collections) {
                    if (err) {
                        throw err;
                    }
                    expect(collections.length === 1);
                    expect(collections[0].features.length === 0);
                    done();
                }
            );
        });

        it('can have different coordinate types', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.query(
                {
                    'page' : 0,
                    'count': 10,
                    'layer'     : layerId,
                    'queryFilter':{
                    }
                },
                function (err, collections) {
                    if (err) {
                        throw err;
                    }
                    const features1 = collections[0].features;
                    featureQuery.query(
                        {
                            'page' : 0,
                            'count': 10,
                            'layer'     : layerId,
                            'queryFilter':{
                                'resultCRS' : maptalks.CRS.BD09LL
                            }
                        },
                        function (err, collections2) {
                            if (err) {
                                throw err;
                            }
                            const features2 = collections2[0].features;
                            for (let i = features2.length - 1; i >= 0; i--) {
                                expect(features2[i].getCoordinates()).not.to.be.eql(features1[i].getCoordinates());
                            }
                            done();
                        }
                    );
                });
        });



        it('identify default spatial database', function (done) {
            const featureQuery = new maptalks.FeatureQuery({
                'host' : host,
                'port' : port,
                'mapdb': mapdb
            });
            featureQuery.identify(
                {
                    'layer'     : layerId,
                    'coordinate': [120, 30],
                    'radius'    : 500
                },
                function (err, collections) {
                    if (err) {
                        throw err;
                    }
                    const features = collections[0].features;
                    expect(features.length === 1);
                    expect(features[0].getProperties().name === 'China');
                    done();
                }
            );
        });

    });

});
