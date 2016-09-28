maptalks.DynamicLayer = maptalks.TileLayer.extend({
    options: {
        baseUrl: '',
        format: 'png',
        // resultCRS: 'WGS84',
        showOnTileLoadComplete: false
        // mapdb: '',
        // layers: [ { name: 'name', condition: '', spatialFilter: {}, fields: ['*'], style: { filter: {}, symbol: {} } } ]
    },

    initialize: function (id, opts) {
        this.setId(id);
        maptalks.Util.setOptions(this, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n = 0;
    },

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @expose
     */
    reload: function () {
        this.n = this.n + 1;
        this.load();
    },

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    onAdd: function () {
        var map = this.getMap();
        if (!this.options['layers'] || !this.options['mapdb']) {
            return false;
        }
        var me = this;
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this._loadDynamicTimeout) {
            clearTimeout(this._loadDynamicTimeout);
        }

        this._loadDynamicTimeout = setTimeout(function () {
            maptalks.Ajax.post(
                {
                    url : me.options.baseUrl,
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                },
                me._buildMapConfig(),
                function (err, response) {
                    if (err) {
                        throw err;
                    }
                    var result = maptalks.Util.parseJSON(response);
                    if (result && result.hasOwnProperty('token')) {
                        me._token = result.token;
                        me._renderer.render(me.options.showOnTileLoadComplete);
                    }
                }
            );
        }, map.options['zoomAnimationDuration'] + 80);
        //通知父类先不载入瓦片
        return false;
    },

    _getTileUrl: function (x, y, z) {
        var parts = [];
        parts.push(this.options.baseUrl);
        parts.push(this._token);
        parts.push(z);
        parts.push(x);
        parts.push(y + '.' + this.options.format);
        var url = parts.join('/');
        return url;
    },

    _buildMapConfig: function () {
        var map = this.getMap();
        var mapConfig = {};
        mapConfig.version = '1.0.0';
        mapConfig.extent = map.getMaxExtent();
        var view = map.getView();
        mapConfig.options = {
            center: map.getCenter(),
            zoom: map.getZoom(),
            view: view.options
        };
        mapConfig.layers = [];
        for (var i = 0, len = this.options.layers.length; i < len; i++) {
            var l = this.options.layers[i];
            var q = {
                // avoid pass string "undefined" to query service
                condition: l.condition ? l.condition : '',
                resultFields: l.fields ? l.fields : ['*']
            };
            if (this.options.resultCRS) {
                q.resultCRS = this.options.resultCRS;
            } // else, result will be return in layer's CRS
            if (l.spatialFilter && maptalks.Util.isObject(l.spatialFilter)) {
                if (l.spatialFilter instanceof maptalks.SpatialFilter) {
                    q.spatialFilter = l.spatialFilter.toJSON();
                } else {
                    q.spatialFilter = l.spatialFilter;
                }
            }

            var layer = {
                id: l.name,
                type: 'maptalks',
                options: {
                    database: this.options.mapdb,
                    layer: l.name,
                    queryFilter: q,
                    style: l.style ? l.style : {}
                }
            };
            mapConfig.layers.push(layer);
        }
        return mapConfig;
    }

});
