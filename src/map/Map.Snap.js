import * as maptalks from 'maptalks';

maptalks.Map.include({
    genSnapConfig(options) {
        if (!options) {
            options = {
                'extent'    : this.getExtent(),
                'zoom'      : this.getZoom(),
                'format'    : 'png'
            };
        }
        if (options.profile && options.profile.version) {
            return options;
        }
        var extent = options['extent'] || this.getExtent();
        const zoom = options['zoom']  || this.getZoom(),
            format = options['format'] || 'png';
        if (extent instanceof maptalks.Geometry) {
            extent = extent.getExtent();
        }
        const serverDir = options['serverDir'],
            serverFileName = options['serverFileName'];

        const profile = this.toJSON(maptalks.Util.extend({}, options['profile'], { 'clipExtent' : extent }));
        profile['extent'] = extent;
        profile.options['zoom'] = zoom;

        profile.options['center'] = extent.getCenter();

        //extra geometries to add to the snapping.
        const extraGeometries = options['extraGeometries'];
        if (extraGeometries) {
            let extraLayer = new maptalks.VectorLayer(maptalks.Util.GUID());
            if (Array.isArray(extraGeometries)) {
                for (let i = 0, len = extraGeometries.length; i < len; i++) {
                    extraLayer.addGeometry(extraGeometries[i].copy());
                }
            } else if (extraGeometries instanceof maptalks.Geometry) {
                extraLayer.addGeometry(extraGeometries.copy());
            }
            if (extraLayer.getCount() > 0) {
                profile['layers'].push(extraLayer.toJSON());
            }
        }
        var snapConfig = {
            'format' : format,
            'profile' : profile
        };
        if (serverDir) { snapConfig['serverDir'] = serverDir; }
        if (serverFileName) { snapConfig['serverFileName'] = serverFileName; }
        return snapConfig;
    },

	/**
     * 截图
     * @param  {Object} options 截图设置
     * @member maptalks.Map
     * @expose
     */
    snap(options, callback) {
        var snapConfig;
        if (options.snaps && Array.isArray(options.snaps)) {
            snapConfig = [];
            for (let i = 0, l = options.snaps.length; i < l; i++) {
                snapConfig.push(this.genSnapConfig(options.snaps[i]));
            }
        } else {
            snapConfig = this.genSnapConfig(options);
        }
        //optional host and port, if need another snap server to perform snapping.
        const host = options['host'];
        maptalks.Ajax.post(
            {
                'url' : host + '/snap/',
                'headers' : {
                    'Content-Type' : 'text/plain'
                }
            },
            snapConfig,
            function (err, responseText) {
                if (err) {
                    throw err;
                }
                const result = JSON.parse(responseText);
                if (callback) {
                    if (result['success']) {
                        callback(null, result);
                    } else {
                        callback(result);
                    }
                }
            }
        );
        return this;
    }
});
