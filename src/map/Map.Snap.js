maptalks.Map.include({
	/**
     * 截图
     * @param  {Object} options 截图设置
     * @member maptalks.Map
     * @expose
     */
    snap:function(options, callback) {
        if (!options) {
            options = {
                "extent"    : this.getExtent(),
                "zoom"      : this.getZoom(),
                "format"    : "png"
            };
        }
        var extent = options['extent'] || this.getExtent(),
            zoom = options['zoom']  || this.getZoom(),
            format = options['format'] || "png";
        var serverDir = options['serverDir'],
            serverFileName = options['serverFileName'];
        //optional host and port, if need another snap server to perform snapping.
        var host = options['host'];
        var url;
        if (host) {
            url = host+'/snapservice/';
        } else {
            var prefixUrl = new maptalks.Url(maptalks.prefix);
            var prefixHost = prefixUrl.getHost();
            var prefixPort = prefixUrl.getPort();
            url = 'http://'+ prefixHost + ':' + prefixPort + '/snapservice/';
        }
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
                for (var i = 0, len=extraGeometries.length; i < len; i++) {
                    extraLayer.addGeometry(extraGeometries[i].copy());
                }
            } else {
                extraLayer.addGeometry(extraGeometries.copy())
            }

            var extraLayerJSON = extraLayer.toJSON();
            profile['layers'].push(extraLayerJSON);
        }
        var snapConfig = {
            "format" : format,
            "profile" : profile
        };
        if (serverDir) {snapConfig['serverDir'] = serverDir;}
        if (serverFileName) {snapConfig['serverFileName'] = serverFileName;}
        var ajax = new maptalks.Util.Ajax(url, 0, JSON.stringify(snapConfig), function(responseText) {
            var result = JSON.parse(responseText);
            if (result['success']) {
                if (callback) {
                    callback(null, result);
                }
            } else {
                if (callback) {
                    callback(result);
                }
            }
        });
        ajax.post("text/plain");
        return this;
    }
});
