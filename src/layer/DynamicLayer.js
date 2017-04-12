import * as maptalks from 'maptalks';
import SpatialFilter from '../query/SpatialFilter';

const options = {
    baseUrl: '',
    format: 'png',
    showOnTileLoadComplete: false
};

export default class DynamicLayer extends maptalks.TileLayer {

    /**
     * Reproduce a DynamicLayer from layer's JSON.
     * @param  {Object} json - layer's JSON
     * @return {maptalks.DynamicLayer}
     * @static
     * @private
     * @function
     */
    static fromJSON(json) {
        if (!json || json['type'] !== 'DynamicLayer') {
            return null;
        }
        return new DynamicLayer(json['id'], json['options']);
    }

    constructor(id, opts) {
        super(id, opts);
        //reload时n会增加,改变瓦片请求参数,以刷新浏览器缓存
        this.n = 0;
    }

    /**
     * 重新载入动态图层，当改变了图层条件时调用
     * @expose
     */
    reload() {
        this.n += 1;
        this.load();
    }

    /**
     * 载入前的准备, 由父类中的load方法调用
     */
    onAdd() {
        const map = this.getMap();
        if (!this.options['layers'] || !this.options['mapdb']) {
            return false;
        }
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this._loadDynamicTimeout) {
            clearTimeout(this._loadDynamicTimeout);
        }

        this._loadDynamicTimeout = setTimeout(() => {
            maptalks.Ajax.post(
                {
                    url : this.options['baseUrl'],
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                },
                this._buildMapConfig(),
                (err, response) => {
                    if (err) {
                        throw err;
                    }
                    const result = maptalks.Util.parseJSON(response);
                    if (result && result.hasOwnProperty('token')) {
                        this._token = result.token;
                        this._renderer.render(this.options.showOnTileLoadComplete);
                    }
                }
            );
        }, map.options['zoomAnimationDuration'] + 80);
        //通知父类先不载入瓦片
        return false;
    }

    _getTileUrl(x, y, z) {
        const parts = [];
        parts.push(this.options['baseUrl']);
        parts.push(this._token);
        parts.push(z);
        parts.push(x);
        parts.push(y + '.' + this.options.format);
        return parts.join('/');
    }

    _buildMapConfig() {
        const map = this.getMap();
        const mapConfig = {};
        mapConfig.version = '1.0.0';
        mapConfig.extent = map.getMaxExtent();
        const view = map.getView();
        mapConfig.options = {
            'center' : map.getCenter(),
            'zoom' : map.getZoom(),
            'view' : view.options
        };
        mapConfig.layers = [];
        for (let i = 0, len = this.options.layers.length; i < len; i++) {
            const l = this.options.layers[i];
            const q = {
                // avoid pass string "undefined" to query service
                condition: l.condition ? l.condition : '',
                resultFields: l.fields ? l.fields : ['*']
            };
            if (this.options.resultCRS) {
                q.resultCRS = this.options.resultCRS;
            } // else, result will be return in layer's CRS
            if (l.spatialFilter && maptalks.Util.isObject(l.spatialFilter)) {
                if (l.spatialFilter instanceof SpatialFilter) {
                    q.spatialFilter = l.spatialFilter.toJSON();
                } else {
                    q.spatialFilter = l.spatialFilter;
                }
            }

            const layerType = l.type || 'maptalks';
            const layerOptions = {
                database: this.options.mapdb,
                layer: l.table || l.name,
                queryFilter: q
            };

            if (layerType !== 'maptalks') {
                maptalks.Util.extend(layerOptions, l.options || {});
            } else {
                maptalks.Util.extend(layerOptions, {
                    style: l.style ? l.style : {}
                });
            }

            const layer = {
                'id'      : l.id || l.name,
                'type'    : layerType,
                'options' : layerOptions
            };
            mapConfig.layers.push(layer);
        }
        return mapConfig;
    }
}

DynamicLayer.mergeOptions(options);

DynamicLayer.registerJSONType('DynamicLayer');
