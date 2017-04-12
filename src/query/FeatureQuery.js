import * as maptalks from 'maptalks';
import SpatialFilter from './SpatialFilter';

/**
 * 查询类
 * @class maptalks.FeatureQuery
 * @author Maptalks Team
 */
export default class FeatureQuery {

    constructor(opts) {
        if (!opts) {
            return;
        }
        this.host = opts['host'];
        this.port = opts['port'];
        this.protocol = opts['protocol'];
        this.mapdb = opts['mapdb'];
    }

    /**
     * 检查查询参数是否正常
     * @return {Boolean} true|false
     */
    check() {
        if (!this.mapdb) {
            return false;
        }
        return true;
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
     * Identify
     * @param  {Object} opts 查询参数
     * @return 查询结果
     * @expose
     */
    identify(opts, callback) {
        if (!opts) {
            return this;
        }
        const coordinate = opts['coordinate'];
        const radius = opts['radius'];
        const spatialFilter = new SpatialFilter(new maptalks.Circle(coordinate, radius), SpatialFilter.RELATION_INTERSECT);
        const queryFilter = {
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
        return this;
    }

    /**
     * query
     * @param  {Object} opts 查询参数
     * @expose
     */
    query(opts, callback) {
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
            let segs = layer.split(',');
            //去掉图层名前后两端的空格, 如 foo1, foo2 , foo3 ----> foo1,foo2,foo3
            for (let i = segs.length - 1; i >= 0; i--) {
                segs[i] = segs[i].replace(/(^\s*)|(\s*$)/g, '');
            }
            layer = segs.join(',');
        }
        //•/databases/{db}/layers/{id}/data?op=query
        const url = this.getHost() + '/rest/sdb/databases/' + this.mapdb + '/layers/' + layer + '/data?op=query';
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
                        callback({ 'success':false, 'errCode':maptalks.Constant.ERROR_CODE_UNKNOWN, 'error':'' });
                    }
                    return;
                }
                const result = maptalks.Util.parseJSON(response);
                if (!result) {
                    //20000是未知错误的错误代码
                    if (maptalks.Util.isFunction(opts['error'])) {
                        callback({ 'success':false, 'errCode':maptalks.Constant.ERROR_CODE_UNKNOWN, 'error':'' });
                    }
                } else if (!result['success']) {
                    callback(result);
                } else {
                    const datas = result['data'];
                    if (!datas || datas.length === 0) {
                        callback(null, []);
                    } else {
                        const collections = [];
                        if (queryFilter['returnGeometry'] === false) {
                            for (let i = 0, len = datas.length; i < len; i++) {
                                collections.push({
                                    'layer' : datas[i]['layer'],
                                    'features' : datas[i]['features']
                                });
                            }
                            //不返回Geometry,直接返回属性数据
                            callback(null, collections);
                        } else {
                            for (let i = 0, len = datas.length; i < len; i++) {
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
    }

    /**
     * 构造查询url
     * @param  {Object} queryFilter 查询条件
     * @return {String} 查询url
     * @expose
     */
    formQueryString(queryFilter) {
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
            const spatialFilter = queryFilter['spatialFilter'];
            const filterGeo = spatialFilter['geometry'];
            if (filterGeo) {
                var paramFilter;
                if (spatialFilter instanceof SpatialFilter) {
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
            if (Array.isArray(fields)) {
                fields = fields.join(',');
            }
            ret.push('fields=' + fields);
        }
        return ret.join('&');
    }
}
