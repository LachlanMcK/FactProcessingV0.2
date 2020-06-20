define(function (require) {
    "use strict";

    var q = require("q"),
        $ = require("jquery"),
        ato = require('framework/AtoFramework'),
        codesTables = [],
        preProcessColsComplete = false;

    function preProcessColumnConfig(config) {
        for (var ct in config.cdn) {
            addLookupCols(config.cdn[ct]);
        }
        for (var cs in config.statics) {
            if (!config.statics[cs].lookupKeys)
                config.statics[cs].lookupKeys = { code: 'code', desc: 'desc' };
            addLookupCols(config.statics[cs]);
        }
        preProcessColsComplete = true;
    }

    function addLookupCols(tbl, parentLookupKeys) {
        if (!tbl.lookupKeys) {
            if (parentLookupKeys)
                tbl.lookupKeys = parentLookupKeys;
            else
                tbl.lookupKeys = { code: undefined, desc: undefined };
        }
        for (var s in tbl.subsets)
            addLookupCols(tbl.subsets[s], tbl.lookupKeys);
        return tbl;
    }

    function filterData(config) {
        //sort, exclude, remap, etc
        var remappedData = {};
        var srcData = codesTables[config.tableName];
        if (srcData && srcData.rows) {
            var filters = config.filters || [];
            remappedData = srcData.rows;
            var sDate = srcData.columnMap[config.byDate.startDate || 'DT_EFFECT'];
            var eDate = srcData.columnMap[config.byDate.endDate || 'DT_END'];
            if (config.byDate) {
                switch (config.byDate.type) {
                    case dateType.Current:
                        var currentDate = moment(new Date(), "DD-MM-YYYY");
                        remappedData = remappedData.filter(function (d) {
                            var recordStartDate = moment(d[sDate], "YYYY-MM-DD");
                            var recordEndDate = moment(d[eDate], "YYYY-MM-DD");
                            return currentDate.isBetween(recordStartDate, recordEndDate) || currentDate.isSame(recordStartDate) || currentDate.isSame(recordEndDate);
                        });
                        break;
                    case dateType.Range:
                        var rangeStartDate = moment(config.byDate.StartRange);
                        var rangeEndDate = moment(config.byDate.EndRange);
                        remappedData = remappedData.filter(function (d) {
                            var recordStartDate = moment(d[sDate], "YYYY-MM-DD");
                            var recordEndDate = moment(d[eDate], "YYYY-MM-DD");
                            return recordStartDate.isBetween(rangeStartDate, rangeEndDate) || recordStartDate.isSame(rangeStartDate) || recordStartDate.isSame(rangeEndDate) ||
                                recordEndDate.isBetween(rangeStartDate, rangeEndDate) || recordEndDate.isSame(rangeStartDate) || recordEndDate.isSame(rangeEndDate);
                        });
                        break;
                }
            }
            if (config.sortOn) {
                var sortIndex = srcData.columnMap[config.sortOn];
                if (srcData.columns[sortIndex].type === 'CHAR')
                    remappedData = remappedData.sort(function (a, b) {
                        if (a[sortIndex] < b[sortIndex]) return -1;
                        if (a[sortIndex] > b[sortIndex]) return 1;
                        return 0;
                    });
                else
                    remappedData = remappedData.sort(function (a, b) {
                        return parseFloat(a[srcData.columnMap[config.sortOn]]) - parseFloat(b[srcData.columnMap[config.sortOn]]);
                    });

            }
            remappedData = remappedData.filter(function (item) {
                //remove rows via config filter
                for (var k = 0; k < filters.length; k++) {
                    if (!Array.isArray(filters[k].val)) {
                        if (item[srcData.columnMap[filters[k].col]] !== filters[k].val) return false;
                    }
                    else {
                        if(!filters[k].val.some(function (val) {
                            return item[srcData.columnMap[filters[k].col]] === val;
                        })) {
                            return false;
                        }
                    }
                }
                //remove any excluded items
                if (config.exclusionItems)
                    for (var r = 0; r < config.exclusionItems.length; r++) {
                        if (item[srcData.columnMap[config.exclusionItems[r].col]] === config.exclusionItems[r].val) return false;
                    }
                return true;
            });

            remappedData = remappedData.map(function (item) {
                var retItem = {};
                for (var k in config.lookupKeys)
                    retItem[k] = item[srcData.columnMap[config.lookupKeys[k]]];
                //remap any desc based on case in reMapItems
                if (config.reMapItems)
                    for (var r = 0; r < config.reMapItems.length; r++)
                        if (retItem.code === config.reMapItems[r].code) {
                            retItem.desc = config.reMapItems[r].desc;
                            break;
                        }
                return retItem;
            });
        }

        return remappedData;
    }

    function retrieveCdnConfigData(settings, parent) {
        var config = {
            srcDataKey: '',
            tableName: name,
            sortOn: '',
            byDate: false
        };
        if (parent) {
            $.extend(config, parent)
            // we don't want to duplicate the parent's subsets
            config.subsets = undefined;
        }
        $.extend(config, settings); //override with child settings

        var mappedData = {};
        if (!settings.nocache)
            mappedData = filterData(config);
        settings.rowItems = mappedData;
        retrieveSubkeys(config);
    }

    function retrieveSubkeys(prnt) {
        var ret = {};
        var subsets = prnt.subsets;
        for (var s in subsets) {
            subsets[s].tableName = prnt.tableName;
            retrieveCdnConfigData(subsets[s], prnt);
        }
    }

    var dateType = {
        All: 0,
        Range: 1,
        Current: 2
    }

    var service = {
        dateType: dateType,
        preProcessColumnConfig: preProcessColumnConfig,
        retrieveRefData: function (config) {
            var self = this;
            var srcPromises = [];
            for (var key in config.cdn) {
                if (!config.cdn[key].tableName)
                    config.cdn[key].tableName = key;
                srcPromises.push(service.primeFromCdn(config.cdn[key].tableName));
            }
            //wait until the source datasets have been loaded
            return Q.all(srcPromises).then(function (a) {
                //process into required data
                for (var ct in config.cdn) {
                    retrieveCdnConfigData(config.cdn[ct]);
                }
                //clear out source data
                codesTables = [];
            });
        },
        primeFromCdn: function (tbl) {
            var path = window.ato.cdnCodesTablePath + '/codes-tables/';
            return $.getJSON(path + tbl + '.json').then(function (response) {
                if (response.name === tbl) {
                    var columns = response.columns, rows = response.rows,
                        numericCols = [], ci, c, ri, r, d, columnMap = {};

                    for (ci = 0; ci < columns.length; ci++) {
                        c = columns[ci];
                        if (c.type === "DECIMAL" || c.type === "INTEGER") {
                            numericCols.push(ci);
                        } else if (c.name === "DT_EFFECT") {
                            response.startDateColumn = ci;
                        } else if (c.name === "DT_END") {
                            response.endDateColumn = ci;
                        }
                        columnMap[c.name] = ci;
                    }
                    response.columnMap = columnMap;

                    if (numericCols.length > 0) {
                        for (ri = 0; ri < rows.length; ri++) {
                            r = rows[ri];
                            for (ci = 0; ci < numericCols.length; ci++) {
                                d = numericCols[ci];
                                r[d] = +r[d];
                            }
                        }
                    }
                    codesTables[tbl] = response;
                }
            }).fail(function (ex) {
                ato.ErrorHandler.handlePromiseRejection('Failed load from cdn sources at ' + path + tbl + '.json')
            });
        }
    };
    return service;
});
