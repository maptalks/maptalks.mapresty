/**
 * 空间过滤类
 * @class maptalks.SpatialFilter
 * @extends maptalks.Class
 * @param {maptalks.Geometry} geometry
 * @param {Number} relation
 * @author Maptalks Team
 */
Z.SpatialFilter=function(geometry, relation) {
    this.geometry = geometry;
    this.relation = relation;
};

Z.Util.extend(Z.SpatialFilter.prototype,{
    /**
     * 获取SpatialFilter中的geometry
     * @return {maptalks.Geometry} SpatialFilter的Geometry
     * @expose
     */
    getGeometry: function() {
        return this.geometry;
    },

    /**
     * 获取SpatialFilter的json
     * @return {String} spatialfilter
     * @expose
     */
    toJSON: function() {
        var geojson = this.geometry;
        if (this.geometry instanceof Z.Geometry) {
            geojson = this.geometry.toGeoJSONGeometry();
        }
        var jsonObj = {
          "geometry": geojson,
          "relation": this.relation
        };
        return jsonObj;
    }

});

Z.Util.extend(Z.SpatialFilter,{
    /**
     * @static
     * @property {Number} RELATION_INTERSECT 相交
     */
    'RELATION_INTERSECT' : 0,
    /**
     * @static
     * @property {Number} RELATION_CONTAIN 包含
     */
    'RELATION_CONTAIN' : 1,
    /**
     * @static
     * @property {Number} RELATION_DISJOINT 分离
     */
    'RELATION_DISJOINT' : 2,
    /**
     * @static
     * @property {Number} RELATION_OVERLAP 重叠
     */
    'RELATION_OVERLAP' : 3,
    /**
     * @static
     * @property {Number} RELATION_TOUCH 接触
     */
    'RELATION_TOUCH' : 4,
    /**
     * @static
     * @property {Number} RELATION_WITHIN 在内部
     */
    'RELATION_WITHIN' : 5,

    /**
     * @static
     * @property {Number} RELATION_INTERECTNOTCONTAIN 相交但不包含关系即within 或 overlap
     */
    'RELATION_INTERECTNOTCONTAIN' : 100,
    /**
     * @static
     * @property {Number} RELATION_CONTAINCENTER 包含中心点
     */
    'RELATION_CONTAINCENTER' : 101,

    /**
     * @static
     * @property {Number} RELATION_CENTERWITHIN 中心点被包含
     */
    'RELATION_CENTERWITHIN' : 102
});
