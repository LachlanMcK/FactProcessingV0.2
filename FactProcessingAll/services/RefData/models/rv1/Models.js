define(function (require) {
    "use strict";
    var RefDataCollection = require('./models/RefDataCollection');
    var RefDataItem = require('./models/RefDataItem');

    // Models
    var models = {
        'RefDataCollection': RefDataCollection,
        'RefDataItem': RefDataItem
    };

    return models;
});
