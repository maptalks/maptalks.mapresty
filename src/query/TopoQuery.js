import * as maptalks from 'maptalks';

//默认结果的symbol
const defaultSymbol = {
    'lineColor' : '#800040',
    'lineWidth' : 2,
    'lineOpacity' : 1,
    'lineDasharray' :[20, 10, 5, 5, 5, 10],
    'polygonOpacity': 0
};

/**
 * 拓扑查询类
 * @class maptalks.TopoQuery
 * @extends maptalks.Class
 * @author Maptalks Team
 */
export default class TopoQuery {

    constructor(opts) {
        if (!opts) {
            return;
        }
        this.host = opts['host'];
        this.port = opts['port'];
        this.protocol = opts['protocol'];
    }

    /**
     * 获取空间库主机地址
     * @return {String} 空间库主机地址
     */
    getHost() {
        if (!this.port && !this.protocol) {
            return this.host;
        }
        return (this.protocol  || 'http:') + '//' + this.host + ':' + this.port;
    }

    /**
     * 计算Geometry的外缓冲，该功能需要引擎服务器版的支持
     * @member maptalks.Map
     * @param {[maptalks.Geometry]} [geometry] [做缓冲的geometry]
     * @param {Number} distance 缓冲距离，单位为米
     * @expose
     */
    buffer(opts, callback) {
        let geometries = opts['geometries'], distance = opts['distance'];
        if (maptalks.Util.isString(distance)) {
            distance = +distance;
        }
        if (!maptalks.Util.isArrayHasData(geometries) || !maptalks.Util.isNumber(distance)) {
            throw new Error('invalid parameters');
        }
        const symbol = opts['symbol'] || defaultSymbol;
        if (!Array.isArray(geometries)) {
            geometries = [geometries];
        }
         //准备参数
        const targets = [];
        for (let i = 0, l = geometries.length; i < l; i++) {
            const geometry = geometries[i];
            if (!(geometry instanceof maptalks.Marker) && !(geometry instanceof maptalks.Circle)) {
                const geoJSON = geometry.toGeoJSONGeometry();
                targets.push(geoJSON);
            }
        }
        function formQueryString() {
            let ret = 'distance=' + distance;
            ret += '&targets=' + encodeURIComponent(JSON.stringify(targets));
            if (opts['urlParameters']) {
                ret += '&' + opts['urlParameters'];
            }
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
        const buffered = [];
        if (targets.length === 0) {
            //全都是点或者圆形
            for (let i = 0, l = geometries.length; i < l; i++) {
                const r = bufferPointOrCircle(geometries[i]);
                if (r) {
                    r.setSymbol(symbol);
                }
                buffered.push(r);
            }
            callback(null, buffered);
        } else {
            const url = this.getHost() + '/rest/geometry/analysis/buffer';
            const queryString = formQueryString();
            maptalks.Ajax.post(
                {
                    'url' : url
                },
                queryString,
                function (err, resultText) {
                    if (err) {
                        throw err;
                    }
                    const result = maptalks.Util.parseJSON(resultText);
                    if (!result['success']) {
                        callback(result);
                        return;
                    }
                    const svrBuffered = maptalks.GeoJSON.toGeometry(result['data']);
                    let tmpIndex = 0;
                    for (let i = 0, l = geometries.length; i < l; i++) {
                        let g;
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
    }

    /**
     * 判断Geometry和参数中的Geometry数组的空间关系，该功能需要引擎服务器版的支持
     * @member maptalks.Map
     * @param {maptalks.Geometry} [geometry] [被relate的Geometry]
     * @param {maptalks.Geometry[]} geometries 输入Geometry数组
     * @param {Number} relation  空间关系，参考maptalks.constant内的常量定义
     * @param {Function} success 回调函数，参数为布尔类型数组，数组长度与geometries参数数组相同，每一位代表相应的判断结果
     * @expose
     */
    relate(opts, callback) {
        const source = opts['source'];
        const relation = opts['relation'];
        let targets = opts['targets'];
        if (targets && !Array.isArray(targets)) {
            targets = [targets];
        }
        if (!source || !maptalks.Util.isArrayHasData(targets) || !maptalks.Util.isNumber(opts['relation'])) {
            throw new Error('invalid parameters');
        }

        function formQueryString() {
            const srcGeoJSON = source.toGeoJSONGeometry();
            const targetGeoJSONs = [];
            for (let i = 0, len = targets.length; i < len; i++) {
                const t = targets[i].toGeoJSONGeometry();
                targetGeoJSONs.push(t);
            }
            let ret = 'source=' + JSON.stringify(srcGeoJSON);
            ret += '&targets=' + JSON.stringify(targetGeoJSONs);
            ret += '&relation=' + relation;
            if (opts['urlParameters']) {
                ret += '&' + opts['urlParameters'];
            }
            return ret;
        }
        const url = this.getHost() + '/rest/geometry/relation';
        const queryString = formQueryString();
        maptalks.Ajax.post(
            {
                url : url
            },
            queryString,
            function (err, resultText) {
                if (err) {
                    throw err;
                }
                const result = maptalks.Util.parseJSON(resultText);
                if (!result['success']) {
                    callback['error'](result);
                    return;
                } else {
                    callback(null, result['data']);
                }
            }
        );
    }
}
