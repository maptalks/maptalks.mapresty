import * as maptalks from 'maptalks';

const options = {
    baseUrl: '',
    format: 'png',
    layers: [],
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

    constructor(id, options) {
        super(id, options);
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
        if (!this.options.baseUrl) {
            return false;
        }
        //保证在高频率load时，dynamicLayer总能在zoom结束时只调用一次
        if (this._loadDynamicTimeout) {
            clearTimeout(this._loadDynamicTimeout);
        }

        this._loadDynamicTimeout = setTimeout(() => {
            maptalks.Ajax.post(
                {
                    url : this.options.baseUrl,
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
                    if (result && result.token) {
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
        parts.push(this.options.baseUrl);
        parts.push(this._token);
        parts.push(z);
        parts.push(x);
        parts.push(y + '.' + this.options.format);
        return parts.join('/');
    }

    _buildMapConfig() {
        const map = this.getMap();
        const view = map.getView();
        const projection = view.getProjection();
        const fullExtent = view.getFullExtent();
        const resolutions = view.getResolutions();

        const mapConfig = {
            version: '1.0.0',
            // mandatory: view, optional: center, zoom
            options: {
                center: map.getCenter(),
                zoom: map.getZoom(),
                view: {
                    projection: projection.code,
                    resolutions: resolutions,
                    fullExtent: [fullExtent.left, fullExtent.bottom, fullExtent.right, fullExtent.top]
                }
            },
            layers: this.options.layers
        };
        const maxExtent = map.getMaxExtent();
        if (maxExtent) {
            mapConfig.extent = [maxExtent.xmin, maxExtent.ymin, maxExtent.xmax, maxExtent.ymax];
        }

        return mapConfig;
    }
}

DynamicLayer.mergeOptions(options);

DynamicLayer.registerJSONType('DynamicLayer');
