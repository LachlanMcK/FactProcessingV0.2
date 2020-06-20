define(function (require) {
    "use strict";

    var RefDataItem = require('./RefDataItem');

        var RefDataCollection = function (fields) {
            this.Name = null; // string
            this.Colums = null;
            this.Items = [];

            if (fields && typeof fields === 'object') {
                this.mapTo(fields.response);
            }
        };

        RefDataCollection.prototype.mapTo = function (fields) {
            var self = this;

            this.Name = fields.name;
            this.Columns = fields.columns;

            fields.rows.forEach(function (value) {
                self.Items.push(new RefDataItem(fields.columns, value));
            });
        };

        return RefDataCollection;
    }
);