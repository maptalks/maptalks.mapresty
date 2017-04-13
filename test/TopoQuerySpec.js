'use strict';

describe('TopoQuery', function () {
    const host = 'localhost';
    const port = 8090;
    describe('query', function () {
        it('buffer', function (done) {
            const distance = 100;
            const topoQuery = new maptalks.TopoQuery({
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
            const topoQuery = new maptalks.TopoQuery({
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
                for (let i = 0; i < 3; i++) {
                    expect(data[i]);
                }
                expect(!data[3]);
                done();
            }
            );
        });
    });
});
