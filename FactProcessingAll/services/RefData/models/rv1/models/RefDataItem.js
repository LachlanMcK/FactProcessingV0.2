define(function (require) {
    "use strict";

    var RefDataItem = function (columns, fields) {
        if (columns && typeof columns === 'object' && fields && typeof fields === 'object') {
            this.mapTo(columns, fields);
        }
    };

    RefDataItem.prototype.mapTo = function (columns, fields) {
        var self = this;

        columns.forEach(function (column, index) {
            self[column.name] = fields[index];
        });
    };

    return RefDataItem;
});