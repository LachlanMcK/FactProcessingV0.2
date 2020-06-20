//LM sadly I had to include: 

function define( mod) {
    const thisModule= mod(require);
    module.exports = thisModule;
}

//LM had to prefix dependencies with ./, plus had to change path to Service & AtoFramework
//LM Oh goody - this define is different to all the others, the callback function has a parameter.
﻿define(function (require) {
    "use strict";

    var q = require("./q"),
        $ = require("./jquery"),
        Service = require('./Service'),
        ato = require('./AtoFramework'),
        serviceName = '/api/v1/codes/', // route to the Web Api controller
        codesTables = [];

    function calculateFullCacheKey(request) {
        var key = calculateFilteredCacheKey(request);

        if (request.startDate && request.endDate) {
            key += "|" + request.startDate + "|" + request.endDate;
        } else if (request.startDate) {
            key += "|" + request.startDate + "|";
        } else if (request.endDate) {
            key += "||" + request.endDate;
        }

        return key;
    }

    function calculateFilteredCacheKey(request) {
        var key = calculateTableCacheKey(request),
            filters = request.filters, fi, subTable;
        if (key === "TCTGCDDCD" && filters && filters.length) {
            for (fi = 0; fi < filters.length; fi++) {
                if (filters[fi].name === "CD_TYPE_GCDDCD") {
                    subTable = filters[fi].value;
                    key += "/" + subTable.substr(1, subTable.length - 2);
                    break;
                }
            }
        }
        return key;
    }

    function calculateTableCacheKey(request) {
        return request.tableName;
    }

    function calculateQueryString(request) {
        var suffix = "";

        if (request.filters) {
            suffix += "?filters=";

            for (var i = 0; i < request.filters.length; i++) {
                if (i > 0) { suffix += ","; }
                suffix += request.filters[i].name + ":" + request.filters[i].value;
            }
        }

        if (request.startDate) {
            suffix += ((suffix) ? "&startDate=" : "?startDate=") + request.startDate;
        }

        if (request.endDate) {
            suffix += ((suffix) ? "&endDate=" : "?endDate=") + request.endDate;
        }

        suffix = request.tableName + "s" + suffix;

        return suffix;
    }

    function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    var service = {
        getCache: function () {
            return codesTables;
        },

        setCache: function (cache) {
            codesTables = cache;
        },

        clearCache: function () {
            codesTables = [];
        },

        prime: function (request) {
            if (typeof request === "string") request = { tableName: request };
            if (!(request && request.tableName)) { throw new Error("tableName is mandatory."); }
            if (!request.key) { throw new Error("key is mandatory."); }

            var options = {
                type: 'GET',
                url: serviceName + calculateQueryString(request)
            };

            return Service.ajax(options).then(function (response) {
                service.initTable(request, response.data);
                if (request.key) {
                    response.key = request.key;
                }
                return response;
            }, function (response) {
                if (console)
                    console.log(response.textStatus + ": " + response.errorThrown);
                return false;
            }).fail(ato.ErrorHandler.handlePromiseRejection(serviceName + ' url: ' + options.url));
        },
        // Code added for performance testing in higher environments and will be subsequent to further review
        primeFromStatics: function (requests, returnError) {
            // path based on SPABath or deployed solution
            var path = window.ato.cdnCodesTablePath + '/codes-tables/mytax-codes.json';
            if (isIE() && isIE() < 10 && path && path.substring(0, 2) === "//" && window.XDomainRequest) //if IE 9 and is CDN and use CORS
            { 
                        var deferred = Q.defer();
                        var xdr = new XDomainRequest();
                        xdr.open("GET", path);
                    xdr.onload = function() {
                            var responses = JSON.parse(xdr.responseText).responses;
                            if (!responses) {
                            deferred.reject();
                            } else {
                            $.each(responses, function(i, tableResponse) {
                                    for (var i = 0; i < requests.length; i++) {
                                        if (tableResponse.response.name === requests[i].req.tableName) {
                                            service.initTable(requests[i].req, tableResponse);
                                    }
                                    }
                                });
                                deferred.resolve(responses);
                            }
                        };
                        xdr.onerror = function() {
                        deferred.reject();
                        };
                    xdr.onprogress = function() {};
                        xdr.send();
                        return deferred.promise;
            } else {
                return $.getJSON(path).then(function (response) {
                    var responses = response.responses;
                    $.each(responses, function (i, tableResponse) {
                        for (var i = 0; i < requests.length; i++) {
                            if (tableResponse.response.name === requests[i].req.tableName) {
                                service.initTable(requests[i].req, tableResponse);
                            }
                        }
                    });
                    return responses;
                }, function (e) {
                    if (returnError) {
                        e.fileName = path;
                        return e;
                    } else
                        ato.ErrorHandler.handlePromiseRejection('Failed load from static sources at ' + path);

                });
            }

        },
        primeGeneric: function (subTable) {
            if (!subTable) { throw new Error("subTable is mandatory."); }
            return service.prime({ tableName: "TCTGCDDCD", filters: [{ name: "CD_TYPE_GCDDCD", value: "'" + subTable + "'" }] });
        },

        initTable: function (request, responsez) {
            var response = responsez.response;
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

            codesTables[calculateFullCacheKey(request)] = response;
        },

        get: function (request) {
            if (typeof request === "string") request = { tableName: request };
            if (!(request && request.tableName)) { throw new Error("tableName is mandatory."); }
            var ct = codesTables[calculateFullCacheKey(request)] ||
                     codesTables[calculateFilteredCacheKey(request)] ||
                     codesTables[calculateTableCacheKey(request)],
                fi, f, ci, ri, r,
                tableName = request.tableName, columnMap,
                filters = request.filters, numericFilters = [], stringFilters = [],
                response, originalRows, filteredRows, applyDateFilter;

            if (ct === undefined) {
                throw new Error("Codes table '" + tableName + "' not primed with cache key less specific then '" + calculateFullCacheKey(request) + "'.");
            }

            columnMap = ct.columnMap;

            if (filters && filters.length) {
                for (fi = 0; fi < filters.length; fi++) {
                    f = filters[fi];
                    ci = columnMap[f.name];
                    if (ci === undefined) {
                        throw new Error("Filter column '" + f.name + "' does not exist in the '" + tableName + "' codes table.");
                    }
                    if (typeof f.value === "string" && f.value.charAt(0) === "'") {
                        stringFilters.push([ci, f.value.substr(1, f.value.length - 2)]);
                    } else {
                        numericFilters.push([ci, +f.value]);
                    }
                }
            } else if (!(request.startDate && request.endDate)) return ct; // should maybe return a clone?

            response = { name: tableName, columns: ct.columns, columnMap: columnMap, rows: [] };
            filteredRows = response.rows;
            originalRows = ct.rows;
            applyDateFilter = (ct.startDateColumn !== undefined && ct.endDateColumn !== undefined &&
              request.startDate && request.endDate);

            rowLoop:
                for (ri = 0; ri < originalRows.length; ri++) {
                    r = originalRows[ri];

                    // apply string filters
                    for (fi = 0; fi < stringFilters.length; fi++) {
                        f = stringFilters[fi];
                        if (r[f[0]] !== f[1]) continue rowLoop;
                    }
                    // apply numeric filters
                    for (fi = 0; fi < numericFilters.length; fi++) {
                        f = numericFilters[fi];
                        if (r[f[0]] !== f[1]) continue rowLoop;
                    }
                    // apply date filter
                    if (applyDateFilter && (
                      request.startDate < r[ct.startDateColumn] ||
                      request.endDate > r[ct.endDateColumn])) continue rowLoop;

                    filteredRows.push(r);
                }

            return response;
        },

        getGeneric: function (subTable) {
            if (!subTable) { throw new Error("subTable is mandatory."); }
            return service.get({ tableName: "TCTGCDDCD", filters: [{ name: "CD_TYPE_GCDDCD", value: "'" + subTable + "'" }] });
        }
    };
    return service;
});
