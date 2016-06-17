/**
 * 拓扑查询类
 * @class maptalks.TopoQuery
 * @extends maptalks.Class
 * @author Maptalks Team
 */
maptalks.TopoQuery = function (opts) {
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
};

maptalks.Util.extend(maptalks.TopoQuery.prototype, {
    //默认结果的symbol
    defaultSymbol : {
        'lineColor' : '#800040',
        'lineWidth' : 2,
        'lineOpacity' : 1,
        'lineDasharray' :[20, 10, 5, 5, 5, 10],
        'polygonOpacity': 0
    },
    /**
     * 获取空间库主机地址
     * @return {String} 空间库主机地址
     */
    getHost:function () {
        return this.host + ':' + this.port;
    },
    /**
     * 计算Geometry的外缓冲，该功能需要引擎服务器版的支持
     * @member maptalks.Map
     * @param {[maptalks.Geometry]} [geometry] [做缓冲的geometry]
     * @param {Number} distance 缓冲距离，单位为米
     * @expose
     */
    buffer:function (opts, callback) {
        var geometries = opts['geometries'], distance = opts['distance'];
        if (maptalks.Util.isString(distance)) {
            distance = +distance;
        }
        if (!maptalks.Util.isArrayHasData(geometries) || !maptalks.Util.isNumber(distance)) {
            throw new Error('invalid parameters');
        }
        var symbol = this.defaultSymbol;
        if (opts['symbol']) {
            symbol = opts['symbol'];
        }
        if (!maptalks.Util.isArray(geometries)) {
            geometries = [geometries];
        }
        var i, len;
         //准备参数
        var targets = [];
        for (i = 0, len = geometries.length; i < len; i++) {
            var geometry = geometries[i];
            if (!(geometry instanceof maptalks.Marker) && !(geometry instanceof maptalks.Circle)) {
                var geoJSON = geometry.toGeoJSONGeometry();
                targets.push(geoJSON);
            }
        }
        function formQueryString() {
            var ret = 'distance=' + distance;
            ret += '&targets=' + encodeURIComponent(JSON.stringify(targets));
            return ret;
        }
        function bufferPointOrCircle(p) {
            // 点和圆形的buffer不需通过服务器而直接进行计算
            if (p instanceof maptalks.Marker) {
                return new maptalks.Circle(p.getCoordinates(), distance);
            } else if (p instanceof maptalks.Circle) {
                return new maptalks.Circle(p.getCoordinates(), p.getRadius() + distance);
            }
            return null;
        }
        var buffered = [];
        if (targets.length === 0) {
            //全都是点或者圆形
            for (i = 0, len = geometries.length; i < len; i++) {
                var r = bufferPointOrCircle(geometries[i]);
                if (r) {
                    r.setSymbol(symbol);
                }
                buffered.push(r);
            }
            callback(null, buffered);
        } else {
            var url = 'http://' + this.getHost() + '/rest/geometry/analysis/buffer';
            var queryString = formQueryString();
            maptalks.Ajax.post(
                {
                    url : url
                },
                queryString,
                function (err, resultText) {
                    if (err) {
                        throw err;
                    }
                    var result = maptalks.Util.parseJSON(resultText);
                    if (!result['success']) {
                        callback(result);
                        return;
                    }
                    var svrBuffered = maptalks.GeoJSON.toGeometry(result['data']);
                    var tmpIndex = 0;
                    for (i = 0, len = geometries.length; i < len; i++) {
                        var g;
                        if ((geometries[i] instanceof maptalks.Marker) || (geometries[i] instanceof maptalks.Circle)) {
                            g = bufferPointOrCircle(geometries[i]);
                        } else {
                            g = svrBuffered[tmpIndex++];
                        }
                        if (g) {
                            g.setSymbol(symbol);
                        }
                        buffered.push(g);
                    }
                    callback(null, buffered);
                }
            );
        }
    },

    /**
     * 判断Geometry和参数中的Geometry数组的空间关系，该功能需要引擎服务器版的支持
     * @member maptalks.Map
     * @param {maptalks.Geometry} [geometry] [被relate的Geometry]
     * @param {maptalks.Geometry[]} geometries 输入Geometry数组
     * @param {Number} relation  空间关系，参考maptalks.constant内的常量定义
     * @param {Function} success 回调函数，参数为布尔类型数组，数组长度与geometries参数数组相同，每一位代表相应的判断结果
     * @expose
     */
    relate:function (opts, callback) {
        var source = opts['source'],
            targets = opts['targets'],
            relation = opts['relation'];
        if (targets && !maptalks.Util.isArray(targets)) {
            targets = [targets];
        }
        if (!source || !maptalks.Util.isArrayHasData(targets) || !maptalks.Util.isNumber(opts['relation'])) {
            throw new Error('invalid parameters');
        }

        function formQueryString() {
            var srcGeoJSON = source.toGeoJSONGeometry();
            var targetGeoJSONs = [];
            for (var i = 0, len = targets.length; i < len; i++) {
                var t = targets[i].toGeoJSONGeometry();
                targetGeoJSONs.push(t);
            }
            var ret = 'source=' + JSON.stringify(srcGeoJSON);
            ret += '&targets=' + JSON.stringify(targetGeoJSONs);
            ret += '&relation=' + relation;
            return ret;
        }
        var url = 'http://' + this.getHost() + '/rest/geometry/relation';
        var queryString = formQueryString();
        maptalks.Ajax.post(
            {
                url : url
            },
            queryString,
            function (err, resultText) {
                if (err) {
                    throw err;
                }
                var result = maptalks.Util.parseJSON(resultText);
                if (!result['success']) {
                    callback['error'](result);
                    return;
                } else {
                    callback(null, result['data']);
                }
            }
        );
    }
});
