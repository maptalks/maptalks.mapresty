'use strict';

var maptalks = (typeof (window) !== 'undefined') ? window.maptalks : require('maptalks'),
    expect = (typeof (window) !== 'undefined') ? window.expect : require('expect.js');

describe('TopoQuery', function () {
    var host = 'localhost',
        port = 11215;
    describe('query', function () {
        it('buffer', function (done) {
            var distance = 100;
            var topoQuery = new maptalks.TopoQuery({
                'host' : host,
                'port' : port
            });
            topoQuery.buffer(
                {
                    'geometries' : [
                        new maptalks.Marker([0, 0]),
                        new maptalks.Polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]),
                        new maptalks.Circle([0, 0], 500)
                    ],
                    'distance' : distance + ''
                },
            function (err, buffered) {
                expect(err === null);
                expect(buffered.length === 3);
                expect(buffered[0] instanceof maptalks.Circle);
                expect(buffered[0].getRadius() === distance);
                expect(buffered[1] instanceof maptalks.Polygon);
                expect(buffered[1].getShell().length >= 5);
                expect(buffered[2] instanceof maptalks.Circle);
                expect(buffered[2].getRadius() === 500 + distance);
                done();
            }
            );
        });

        it('relate', function (done) {

            var topoQuery = new maptalks.TopoQuery({
                'host' : host,
                'port' : port
            });
            topoQuery.relate(
                {
                    'source' : new maptalks.Marker([0, 0]),
                    'targets' : [
                        new maptalks.Marker([0, 0]),
                        new maptalks.Polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]),
                        new maptalks.Circle([0, 0], 500),
                        new maptalks.Circle([100, 100], 500)
                    ],
                    'relation' : 0
                },
            function (err, data) {
                expect(err === null);
                expect(data.length === 4);
                for (var i = 0; i < 3; i++) {
                    expect(data[i]);
                }
                expect(!data[3]);
                done();
            }
            );
        });
    });
});
