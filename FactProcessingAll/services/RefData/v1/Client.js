define(function (require) {
    "use strict";

    var Logger = require('framework/components/Logger');


    var ClientBase = require('../../ClientBase');
    var Rv1Models = require('../models/rv1/Models');
    var ErrorHandler = require('framework/handlers/ErrorHandler');

    var internal = {
        // Codestables being fetched
        fetching: {
        },
        // Codestables that have been fetched
        cache: {
        },

        // Private functions
        downloadRefData: downloadRefData,
    };

    var service = {
        methods: {
            RefData: { name: 'RefData', method: 'GET', url: '/api/v1/codes/' }
        },

        // Methods
        getRefData: getRefData,
        getRefDataCollection: getRefDataCollection,
        getRefDataInCodeTableByCodeAndValue: getRefDataInCodeTableByCodeAndValue,
        insertCachedData: insertCachedData,


        // Private fields (for testing only)
        '-private': {
            clearCache: clearCache
        },
        // overrideable
        ErrorHandler: ErrorHandler
    };

    ClientBase.Initialize(service, { 'Rv1': Rv1Models }, 'Rv1');

    function clearCache() {
        internal.cache = {};
    }

    function insertCachedData(key, data) {
        internal.cache[key] = data;
    }

    function createUrl(table, filter, startDate, endDate) {
        var url = encodeURIComponent(table) + 's';
        if (filter || startDate || endDate) {
            url += '?';
            if (filter)
                url += 'filters=' + encodeURIComponent(filter);
            if (startDate)
                url += '&startDate=' + encodeURIComponent(startDate);
            if (endDate)
                url += '&endDate=' + encodeURIComponent(endDate);
        }
        return url;
    }

    function downloadRefData(table, filter, startDate, endDate) {
        var urlComponent = createUrl(table, filter, startDate, endDate);

        var data = internal.cache[urlComponent];
        if (data) {
            Logger.logInfo('refData returned from cache', 'RefDataService.downloadRefData', { url: urlComponent });
            Logger.logDebug('refData contents', 'RefDataService.downloadRefData', data);
            return Q.fcall(function () {
                return data;
            });
        }
        data = internal.fetching[urlComponent];
        if (data) {
            Logger.logInfo('refData already being fetched', 'RefDataService.downloadRefData', { url: urlComponent });
            return data;
        }
        var promise = service.InvokeGet('RefData', service.methods.RefData.url + urlComponent, service.modelContracts.RefDataCollection)
            .then(function (data) {
                internal.cache[urlComponent] = data;
                internal.fetching[urlComponent] = undefined;
                return data;
            }, function (response) {
                // navigate the user to the error screen.
                service.ErrorHandler.handleServiceError(service.name, service.url + urlComponent, response.jqXHR);
            }).fail(service.ErrorHandler.handlePromiseRejection('RefDataService.downloadRefData'));

        internal.fetching[urlComponent] = promise;

        return promise;
    }

    function parseFilter(filter) {
        var filters = {
            client: undefined,
            server: undefined,
            startDate: undefined,
            endDate: undefined
        };

        if (typeof filter === 'function') {
            filters.client = filter;
        } else if (typeof filter === 'string') {
            filters.server = filter;
        } else if (typeof filter === 'object') {
            filters.client = filter.client;
            filters.server = filter.server;
            filters.startDate = filter.startDate;
            filters.endDate = filter.endDate;
        } else {

        }

        return filters;
    }

    function getRefData(table, filter) {
        if (!table)
            throw new Error('getRefData called without an table parameter.');
        if (!filter)
            throw new Error('getRefData called without a filter parameter.');

        var filters = parseFilter(filter);

        if (!filters.client)
            throw new Error('getRefData called without a client filter.');

        return downloadRefData(table, filters.server, filters.startDate, filters.endDate).then(function (data) {
            var match = ko.utils.arrayFirst(data.Items, function (dataItem) {
                return filters.client(dataItem);
            });
            if (match)
                return match;
        }).fail(service.ErrorHandler.handlePromiseRejection('RefDataService.getRefData'));
    }

    function getRefDataCollection(table, filter) {
        if (!table)
            throw new Error('getRefDataCollection called without an table parameter.');

        var filters = parseFilter(filter);

        return downloadRefData(table, filters.server, filters.startDate, filters.endDate).then(function (data) {
            var filteredItems = [];
            data.Items.forEach(function (row) {
                if (!filters.client || filters.client(row))
                    filteredItems.push(row);
            });
            return filteredItems;
        }).fail(service.ErrorHandler.handlePromiseRejection('RefDataService.getRefDataCollection'));
    }

    function getRefDataInCodeTableByCodeAndValue(table, codeField, value, decodeField, serverFilter) {
        if (!table)
            throw new Error('getRefDataInCodeTableByCodeAndValue called without table parameter.');
        if (!codeField)
            throw new Error('getRefDataInCodeTableByCodeAndValue called without codeField parameter.');
        if (!decodeField)
            throw new Error('getRefDataInCodeTableByCodeAndValue called without decodeField parameter.');
        if (value === undefined)
            throw new Error('getRefDataInCodeTableByCodeAndValue called without value parameter.');
        var filter = function (refData) {
            return String(refData[codeField]).toUpperCase() === String(value).toUpperCase();
        };

        var filters = {
            client: filter,
            server: serverFilter
        }

        return getRefData(table, filters).then(function (response) {
            if (response === undefined)
                return '';
            else
                return response[decodeField];
        }).fail(service.ErrorHandler.handlePromiseRejection('RefDataService.getRefDataInCodeTableByCodeAndValue'));
    }

    return service;
}
);
