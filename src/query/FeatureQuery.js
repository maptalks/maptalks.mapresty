/**
 * 查询类
 * @class maptalks.FeatureQuery
 * @extends maptalks.Class
 * @author Maptalks Team
 */
maptalks.FeatureQuery = function (opts) {
    if (!opts) {
        return;
    }
    this.host = opts['host'];
    this.port = opts['port'];
    if (!this.host || !this.port) {
        //默认采用js的服务地址作为查询地址
        var url = new maptalks.Url(maptalks.prefix);
        this.host = url.getHost();
        this.port = url.getPort();
    }
    this.mapdb = opts['mapdb'];
};

maptalks.Util.extend(maptalks.FeatureQuery.prototype, {

    /**
     * 检查查询参数是否正常
     * @return {Boolean} true|false
     */
    check:function () {
        if (!this.mapdb) {
            return false;
        }
        return true;
    },

    /**
     * 获取空间库主机地址
     * @return {String} 空间库主机地址
     */
    getHost:function () {
        return this.host + ':' + this.port;
    },

    /**
     * Identify
     * @param  {Object} opts 查询参数
     * @return 查询结果
     * @expose
     */
    identify:function (opts, callback) {
        if (!opts) {
            return;
        }
        var coordinate = opts['coordinate'];
        var radius = opts['radius'];
        var spatialFilter = new maptalks.SpatialFilter(new maptalks.Circle(coordinate, radius), maptalks.SpatialFilter.RELATION_INTERSECT);
        var queryFilter = {
            'spatialFilter': spatialFilter,
            'condition': opts['condition']
        };
        if (opts['resultCRS']) {
            queryFilter['resultCRS'] = opts['resultCRS'];
        }
        opts['queryFilter'] = queryFilter;
        opts['page'] = 0;
        opts['count'] = 1;
        this.query(opts, callback);
    },

    /**
     * query
     * @param  {Object} opts 查询参数
     * @expose
     */
    query:function (opts, callback) {
        if (!opts || !this.check()) {
            throw new Error('invalid options for FeatureQuery\'s query method.');
        }
        if (!opts['layer']) {
            throw new Error('layer is not specified in query options.');
        }
        var layer = opts['layer'];

        if (!layer) {
            throw new Error('layer is not specified in query options.');
        }
        if (maptalks.Util.isArrayHasData(layer)) {
            layer = layer.join(',');
        } else if (maptalks.Util.isString(layer)) {
            var segs = layer.split(',');
            //去掉图层名前后两端的空格, 如 foo1, foo2 , foo3 ----> foo1,foo2,foo3
            for (var i = segs.length - 1; i >= 0; i--) {
                segs[i] = segs[i].replace(/(^\s*)|(\s*$)/g, '');
            }
            layer = segs.join(',');
        }
        //•/databases/{db}/layers/{id}/data?op=query
        var url = 'http://' + this.getHost() + '/rest/sdb/databases/' + this.mapdb + '/layers/' + layer + '/data?op=query';
        var queryFilter = opts['queryFilter'];
        if (!queryFilter) {
            //默认的queryFilter
            queryFilter = {
                'fields':'*'
            };
        }
        var postData = this.formQueryString(queryFilter);
        if (maptalks.Util.isNumber(opts['page'])) {
            postData += '&page=' + opts['page'];
        }
        if (maptalks.Util.isNumber(opts['count'])) {
            postData += '&count=' + opts['count'];
        }

        maptalks.Ajax.post(
            {
                url : url
            },
            postData,
            function (err, response) {
                if (err) {
                    throw err;
                }
                if (!response) {
                    //20000是未知错误的错误代码
                    if (maptalks.Util.isFunction(opts['error'])) {
                        callback({'success':false, 'errCode':maptalks.Constant.ERROR_CODE_UNKNOWN, 'error':''});
                    }
                    return;
                }
                var result = maptalks.Util.parseJSON(response);
                if (!result) {
                    //20000是未知错误的错误代码
                    if (maptalks.Util.isFunction(opts['error'])) {
                        callback({'success':false, 'errCode':maptalks.Constant.ERROR_CODE_UNKNOWN, 'error':''});
                    }
                } else if (!result['success']) {
                    callback(result);
                } else {
                    var datas = result['data'];
                    if (!maptalks.Util.isArrayHasData(datas)) {
                        callback(null, []);
                    } else {
                        var i, len;
                        var collections = [];
                        if (queryFilter['returnGeometry'] === false) {
                            for (i = 0, len = datas.length; i < len; i++) {
                                collections.push({
                                    'layer' : datas[i]['layer'],
                                    'features' : datas[i]['features']
                                });
                            }
                            //不返回Geometry,直接返回属性数据
                            callback(null, collections);
                        } else {
                            for (i = 0, len = datas.length; i < len; i++) {
                                collections.push({
                                    'layer' : datas[i]['layer'],
                                    'features' : maptalks.GeoJSON.toGeometry(datas[i]['features'])
                                });
                            }
                            callback(null, collections);
                        }
                    }
                }
            }
        );
    },

    /**
     * 构造查询url
     * @param  {Object} queryFilter 查询条件
     * @return {String} 查询url
     * @expose
     */
    formQueryString:function (queryFilter) {
        var ret = [
            'encoding=utf-8',
            'mapdb=' + this.mapdb
        ];
        if (queryFilter['resultCRS']) {
            ret.push('resultCRS=' + encodeURIComponent(JSON.stringify(queryFilter['resultCRS'])));
        }
        if (!maptalks.Util.isNil(queryFilter['returnGeometry'])) {
            ret.push('returnGeometry=' + queryFilter['returnGeometry']);
        }
        if (queryFilter['spatialFilter']) {
            var spatialFilter = queryFilter['spatialFilter'];
            var filterGeo = spatialFilter['geometry'];
            if (filterGeo) {
                var paramFilter;
                if (spatialFilter instanceof maptalks.SpatialFilter) {
                    paramFilter = spatialFilter.toJSON();
                } else {
                    paramFilter = spatialFilter;
                    if (filterGeo instanceof maptalks.Geometry) {
                        paramFilter['geometry'] = filterGeo.toGeoJSONGeometry();
                    }
                }
                ret.push('spatialFilter=' + encodeURIComponent(JSON.stringify(paramFilter)));
            }

        }
        if (queryFilter['condition']) {
            ret.push('condition=' + encodeURIComponent(queryFilter['condition']));
        }
        if (queryFilter['resultFields']) {
            var fields = queryFilter['resultFields'];
            if (maptalks.Util.isArray(fields)) {
                fields = fields.join(',');
            }
            ret.push('fields=' + fields);
        }
        return ret.join('&');
    }
});
