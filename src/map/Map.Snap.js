maptalks.Map.include({
    genSnapConfig: function (options) {
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
        var extent = options['extent'] || this.getExtent(),
            zoom = options['zoom']  || this.getZoom(),
            format = options['format'] || 'png';
        if (extent instanceof maptalks.Geometry) {
            extent = extent.getExtent();
        }
        var serverDir = options['serverDir'],
            serverFileName = options['serverFileName'];

        var profile = this.toJSON(maptalks.Util.extend({}, options['profile'], {'clipExtent':extent}));
        profile['extent'] = extent;
        profile.options['zoom'] = zoom;
        var center = extent.getCenter();
        profile.options['center'] = center;

        //extra geometries to add to the snapping.
        var extraGeometries = options['extraGeometries'];
        if (extraGeometries) {
            var extraLayer = new maptalks.VectorLayer(maptalks.Util.GUID());
            if (maptalks.Util.isArrayHasData(extraGeometries)) {
                for (var i = 0, len = extraGeometries.length; i < len; i++) {
                    extraLayer.addGeometry(extraGeometries[i].copy());
                }
            } else {
                extraLayer.addGeometry(extraGeometries.copy());
            }

            var extraLayerJSON = extraLayer.toJSON();
            profile['layers'].push(extraLayerJSON);
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
    snap:function (options, callback) {
        var snapConfig;
        if (options.snaps && maptalks.Util.isArray(options.snaps)) {
            snapConfig = [];
            for (var i = 0, len = options.snaps.length; i < len; i++) {
                snapConfig.push(this.genSnapConfig(options.snaps[i]));
            }
        } else {
            snapConfig = this.genSnapConfig(options);
        }
        //optional host and port, if need another snap server to perform snapping.
        var host = options['host'];
        var url;
        if (host) {
            url = host + '/snap/';
        } else {
            var prefixUrl = new maptalks.Url(maptalks.prefix);
            var prefixHost = prefixUrl.getHost();
            var prefixPort = prefixUrl.getPort();
            url = 'http://' + prefixHost + ':' + prefixPort + '/snap/';
        }

        maptalks.Ajax.post(
            {
                url : url,
                headers : {
                    'Content-Type' : 'text/plain'
                }
            },
            snapConfig,
            function (err, responseText) {
                if (err) {
                    throw err;
                }
                var result = JSON.parse(responseText);
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
