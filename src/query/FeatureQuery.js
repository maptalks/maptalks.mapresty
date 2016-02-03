/**
 * 查询类
 * @class maptalks.FeatureQuery
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z.FeatureQuery=function(opts) {
    if (!opts) {
        return;
    }
    this.host = opts['host'];
    this.port = opts['port'];
    if (!this.host || !this.port) {
        //默认采用js的服务地址作为查询地址
        var url = new Z.Url(Z.prefix);
        this.host = url.getHost();
        this.port = url.getPort();
    }
    this.mapdb = opts['mapdb'];
};

Z.Util.extend(Z.FeatureQuery.prototype,{

    /**
     * 检查查询参数是否正常
     * @return {Boolean} true|false
     */
    check:function() {
        if (!this.mapdb) {
            return false;
        }
        return true;
    },

    /**
     * 获取空间库主机地址
     * @return {String} 空间库主机地址
     */
    getHost:function() {
        return this.host+':'+this.port;
    },

    /**
     * Identify
     * @param  {Object} opts 查询参数
     * @return 查询结果
     * @expose
     */
    identify:function(opts, callback) {
        if (!opts) {
            return;
        }
        var coordinate = opts['coordinate'];
        var radius = opts["radius"];
        var spatialFilter = new Z.SpatialFilter(new Z.Circle(coordinate, radius), Z.SpatialFilter.RELATION_INTERSECT);
        var queryFilter = {
            'spatialFilter': spatialFilter,
            'condition': opts['condition']
        };
        if (opts['inputCRS']) {
            queryFilter['inputCRS'] = opts['inputCRS'];
        }
        if (opts['resultCRS']) {
            queryFilter['resultCRS'] = opts['resultCRS'];
        }
        opts['queryFilter']=queryFilter;
        opts['page'] = 0;
        opts['count'] = 1;
        this.query(opts, callback);
    },

    /**
     * query
     * @param  {Object} opts 查询参数
     * @expose
     */
    query:function(opts, callback) {
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
        if (Z.Util.isArrayHasData(layer)) {
            layer = layer.join(',');
        } else if (Z.Util.isString(layer)) {
            var segs = layer.split(',');
            //去掉图层名前后两端的空格, 如 foo1, foo2 , foo3 ----> foo1,foo2,foo3
            for (var i = segs.length - 1; i >= 0; i--) {
                segs[i] = segs[i].replace(/(^\s*)|(\s*$)/g,'');
            }
            layer = segs.join(',');
        }
        //•/databases/{db}/layers/{id}/data?op=query
        var url='http://'+this.getHost()+"/enginerest/rest/databases/"+this.mapdb+"/layers/"+layer+"/data?op=query";
        var queryFilter = opts['queryFilter'];
        if (!queryFilter) {
            //默认的queryFilter
            queryFilter = {
                'fields':'*'
            };
        }
        var queryString=this.formQueryString(queryFilter);
        if (Z.Util.isNumber(opts['page'])) {
            queryString += "&page="+opts['page'];
        }
        if (Z.Util.isNumber(opts['count'])){
            queryString += "&count="+opts['count'];
        }
        //var beginTime=new Date().getTime();
        var ajax = new Z.Util.Ajax(url,0,queryString,function(response){
            if (!response) {
                //20000是未知错误的错误代码
                if (Z.Util.isFunction(opts['error'])) {
                    callback({"success":false,"errCode":Z.Constant.ERROR_CODE_UNKNOWN,"error":""});
                }
                return;
            } else {
                var result = Z.Util.parseJSON(response);
                if (!result) {
                    //20000是未知错误的错误代码
                    if (Z.Util.isFunction(opts['error'])) {
                        callback({"success":false,"errCode":Z.Constant.ERROR_CODE_UNKNOWN,"error":""});
                    }
                } else if (!result["success"]) {
                    callback(result);

                } else {
                    var datas=result["data"];
                    if (!Z.Util.isArrayHasData(datas)) {
                        callback(null,[]);
                    } else {
                        var i, len;
                        var collections = [];
                        if (false === queryFilter['returnGeometry']) {
                            for (i = 0, len=datas.length; i < len; i++) {
                                collections.push({
                                    "layer" : datas[i]['layer'],
                                    "features" : datas[i]['features']
                                });
                            }
                            //不返回Geometry,直接返回属性数据
                            callback(null,collections);
                        } else {
                            for (i = 0, len=datas.length; i < len; i++) {
                                collections.push({
                                    "layer" : datas[i]['layer'],
                                    "features" : Z.GeoJSON.fromGeoJSON(datas[i]['features'])
                                });
                            }
                            //不返回Geometry,直接返回属性数据
                            callback(null,collections);
                        }
                    }
                }
            }

            ajax = null;
        });

        ajax.post();
    },

    /**
     * 构造查询url
     * @param  {Object} queryFilter 查询条件
     * @return {String} 查询url
     * @expose
     */
    formQueryString:function(queryFilter) {
        var ret = 'encoding=utf-8';
        //ret+="&method=add";
        ret+='&mapdb='+this.mapdb;
        if (queryFilter['inputCRS']) {
            ret+='&inputCrs='+encodeURIComponent(JSON.stringify(queryFilter['inputCRS']));
        }
        if (queryFilter['resultCRS']) {
            ret+='&resultCrs='+encodeURIComponent(JSON.stringify(queryFilter['resultCRS']));
        }
        if (!Z.Util.isNil(queryFilter['returnGeometry'])) {
            ret+='&returnGeometry='+queryFilter['returnGeometry'];
        }
        if (queryFilter['spatialFilter']) {
            var spatialFilter = queryFilter['spatialFilter'];
            var filterGeo = spatialFilter['geometry'];
            if (filterGeo) {
                var paramFilter;
                if (spatialFilter instanceof Z.SpatialFilter) {
                    paramFilter = spatialFilter.toJSON();
                } else {
                    paramFilter = spatialFilter;
                    if (filterGeo instanceof Z.Geometry) {
                        paramFilter['geometry'] = filterGeo.toGeoJSONGeometry();
                    }
                }
                ret += ('&spatialFilter='+encodeURIComponent(JSON.stringify(paramFilter)));
            }

        }
        if (queryFilter['condition']) {
            ret += ('&condition='+encodeURIComponent(queryFilter['condition']));
        }
        if (queryFilter['resultFields']) {
            var fields = queryFilter['resultFields'];
            if (Z.Util.isArray(fields)) {
                fields = fields.join(',');
            }
            ret += ('&fields='+fields);
        }
        return ret;
    }
});
