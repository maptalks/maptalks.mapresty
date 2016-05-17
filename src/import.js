/*eslint-disable no-unused-vars*/
var maptalks;
var nodeEnv = typeof module !== 'undefined' && module.exports;
if (nodeEnv)  {
    maptalks = require('maptalks');
} else {
    maptalks = window.maptalks;
}
/*eslint-enable no-unused-vars*/
