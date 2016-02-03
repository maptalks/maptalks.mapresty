Z['DynamicLayer'] = Z.DynamicLayer = Z.TileLayer.extend({
    type: 'dynamic',

    //瓦片图层的基础ZIndex
    baseZIndex: 50,

    options: {
        baseUrl: '',
        format: 'png',
        // inputCRS: Z.CRS.createProj4('+proj=longlat +datum=GCJ02'),
        resultCRS: Z.CRS.createProj4('+proj=merc +datum=GCJ02'),
        showOnTileLoadComplete: false
        // mapdb: '',
        // layers: [{name: 'name', condition: '', spatialFilter: {}, cartocss: '', cartocss_version: ''}]
    },

    initialize: function(id, opts) {
        this.setId(id);
        Z.Util.setOptions(this, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n = 0;
    },

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @expose
     */
    reload: function() {
        this.n = this.n + 1;
        this.load();
    },

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    _prepareLoad: function() {
        var map = this.getMap();
        if (!this.options['layers'] || !this.options['mapdb']) {
            return false;
        }
        var me = this;
        var url = this.options.baseUrl;
        var queryString = this._formQueryString();
        var ajax = new Z.Util.Ajax(url, 0, queryString, function(responseText) {
            var result = Z.Util.parseJSON(responseText);
            if (result && result.hasOwnProperty('layergroupid')) {
                me._token = result.layergroupid;
                me._renderer.render(me.options.showOnTileLoadComplete);
            }
        });
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this._loadDynamicTimeout) {
            clearTimeout(this._loadDynamicTimeout);
        }

        this._loadDynamicTimeout = setTimeout(function() {
            ajax.post('application/json');
        }, map._getZoomMillisecs() + 80);
        //通知父类先不载入瓦片
        return false;
    },

    _getTileUrl: function(x, y, z) {
        return this._getRequestUrl(y, x, z);
    },

    /**
     * 获得瓦片请求地址
     * @param topIndex
     * @param leftIndex
     * @param zoomLevel
     * @returns
     */
    _getRequestUrl: function(topIndex, leftIndex, zoom) {
        var map = this.getMap();
        var res = map._getResolution(zoom);
        var tileConfig = this._getTileConfig();
        var sw = tileConfig.getTileProjectedSw(topIndex, leftIndex, res);
        var parts = [];
        parts.push(this.options.baseUrl);
        parts.push(this._token);
        parts.push(zoom);
        parts.push(res);
        parts.push(sw[0]); // xmin
        parts.push(sw[1]); // ymin
        var url = parts.join('/');
        url += '.' + this.options.format;
        return url;
    },

    _formQueryString: function() {
        var mapConfig = {};
        mapConfig.version = '1.0.0';
        // mapConfig.extent = [];
        mapConfig.layers = [];
        for(var i = 0, len = this.options.layers.length; i < len; i++) {
            var l = this.options.layers[i];
            var q = {
                // avoid pass string "undefined" to query service
                condition: l.condition ? l.condition : '',
                resultFields: ['*']
            };
            if (this.options.inputCRS) {
                q.inputCRS = this.options.inputCRS;
            } // else, spatialFilter will be treat as in layer's CRS
            if (this.options.resultCRS) {
                q.resultCRS = this.options.resultCRS;
            } // else, result will be return in layer's CRS
            if (l.spatialFilter && Z.Util.isObject(l.spatialFilter)) {
                if (l.spatialFilter instanceof Z.SpatialFilter) {
                    q.spatialFilter = l.spatialFilter.toJSON();
                } else {
                    q.spatialFilter = l.spatialFilter;
                }
            }
            var layer = {
                type: 'maptalks',
                options: {
                    dbname: this.options.mapdb,
                    layer: l.name,
                    filter: JSON.stringify(q),
                    cartocss: l.cartocss,
                    cartocss_version: l.cartocss_version
                }
            };
            mapConfig.layers.push(layer);
        }
        return JSON.stringify(mapConfig);
    }

});
