const CONFIG_PATH = '../../conf.js';
import {conf as config} from '../../conf.js';
import elasticsearch from 'elasticsearch';

var Utils = require("./Utils");

const Search = require("./logic/search");
const makeQuery = require("./logic/make_query").make_query;

module.exports = class Sysmon_Search_Logic {

    constructor(host, port) {
        //var elasticsearch = require('elasticsearch');
        this.client = new elasticsearch.Client({
            log: 'trace',
            host: host + ':' + port
        });
    }

    // ----------------------------------------------
    // Common Function: Search Request
    async search(bodyObj) {
        console.log("search: " + JSON.stringify(bodyObj));
        const result = await this.client.search({
            index: 'winlogbeat-*',
            // size: 1000,
            body: bodyObj
        });
        /*
        }, function(error, response) {
            if (!error) {
                console.log(response);
                return response;
            } else {
                console.log(['error', 'elastic-translator'], error);
                return;
            }
        });
        */
        return result;
    }
    // ----------------------------------------------

    // Common Function: Alert Search Request
    search_alert(bodyObj) {
        const result = this.client.search({
            index: 'sysmon-search-alert-*',
            // size: 1000,
            body: bodyObj
        }, function(error, response) {
            if (!error) {
                // console.log(response);
                //callback(response);
                return response;
            } else {
                console.log(['error', 'elastic-translator'], error);
                //callback(null);
                return;
            }
        });
        return result;
    }
    // ----------------------------------------------

    // Common Function: Statistical Search Request
    search_statistical(bodyObj) {
        const result = this.client.search({
            index: 'sysmon-search-statistics-*',
            // size: 1000,
            body: bodyObj
        }, function(error, response) {
            if (!error) {
                // console.log(response);
                return response;
            } else {
                console.log(['error', 'elastic-translator'], error);
                return;
            }
        });
        return result;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Host List
    async hosts(params) {
        var search_items_and_date_query = [];
        console.log("params: " + JSON.stringify(params));
        if (typeof params !== "undefined" && params !== null && Object.keys(params).length !== 0) {
            if ("keyword" in params && typeof params.keyword !== "undefined" && params.keyword !== "") {
                search_items_and_date_query.push({
                    "wildcard": {
                        "winlog.computer_name.keyword": "*" + params['keyword'].toLowerCase() + "*"
                    }
                });
            }

            if (("fm_start_date" in params && typeof params.fm_start_date !== "undefined") ||
                ("fm_end_date" in params && typeof params.fm_end_date !== "undefined")) {

                var timestamp_range = {};
                if ("fm_start_date" in params && typeof params.fm_start_date !== "undefined") {
                    timestamp_range["gte"] = params.fm_start_date;
                }
                if ("fm_end_date" in params && typeof params.fm_end_date !== "undefined") {
                    //timestamp_range["lt"] = params.fm_end_date;
                }
                search_items_and_date_query.push({
                    "range": {
                        "@timestamp": timestamp_range
                    }
                });
            }
        }

        var searchObj = {
            //"size": 0,
            "query": {
                "bool": {
                    "must": search_items_and_date_query
                }
            },
            "aggs": {
                "group_by": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "interval": "1d",
                        "format": "yyyy-MM-dd"
                    },
                    "aggs": {
                        "computer_names": {
                            "terms": {
                                "size": 1000,
                                "field": "winlog.computer_name.keyword"
                            }
                        }
                    }
                }
            }
        };
        /*
        const util = require('util');
        console.log('########------------ query -------------########');
        console.log(util.inspect(searchObj, {
            depth: null
        }));
        */
        const el_result = await this.search(searchObj);
        console.log("result: " + JSON.stringify(el_result))
        var results = [];
        //var hits = el_result.aggregations.group_by.buckets;
        var hits =　el_result.aggregations?el_result.aggregations.group_by.buckets:[];
        for (var index in hits) {
            var item = hits[index];
            var tmp = {
                "date": item['key_as_string'],
                "result": item['computer_names']['buckets']
            };
            results.push(tmp);
        }
        return results;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Create Process
    async process_list(hostname, eventtype, date, searchObj) {
        if(searchObj==null){
            if (date.length === 23) {
                var date_dict = Utils.get_range_datetime(date);
                searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                "match": {
                                    "winlog.computer_name.keyword": hostname,
                                }
                            },
                            {
                                "terms": {
                                    "winlog.event_id": [1, 11, 12, 13, 3, 8, 2, 7, 19, 20, 21],
                                }
                            },
                            {
                                "range": {
                                    "@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }
                                }
                            }]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    //"_source": ["record_number", "event_data", "event_id"]
                    "_source": ["winlog.record_id", "winlog.event_data", "winlog.event_id"]
                };
            } else {
                var event_id = [1];
                switch (eventtype) {
                    case 'create_file':
                        event_id = [11];
                        break;
                    case 'registory':
                        event_id = [12, 13, 14];
                        break;
                    case 'net':
                        event_id = [3];
                        break;
                    case 'remote_thread':
                        event_id = [8];
                        break;
                    case 'file_create_time':
                        event_id = [2];
                        break;
                    case 'image_loaded':
                        event_id = [7];
                        break;
                    case 'wmi':
                        event_id = [19, 20, 21];
                        break;
                }

                searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "winlog.computer_name.keyword": hostname,
                                    }
                                },
                                {
                                    "terms": {
                                        "winlog.event_id": event_id,
                                    }
                                },
                                {
                                    "match": {
                                        "@timestamp": date
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    //"_source": ["record_number", "event_data", "event_id"]
                    "_source": [
                        "event",
                        "process",
                        "winlog",
                        "network",
                        "destination",
                        "source",
                        "file"
                        //"winlog.record_id",
                        //"winlog.event_data",
                        //"winlog.event_id"
                    ]
                };
            }
        }

        const el_result = await Search.search(searchObj);
        if (el_result) {
            var hits = el_result.hits.hits;

            var results = [];

            for (var index in hits) {
                var hit = hits[index]._source;
                let data = hit.winlog.event_data;
                // results.push( hit );
                var tmp = {
                    //"number": hit.record_number,
                    "number": hit.winlog.record_id,
                    //"image": data.Image,
                    //"guid": data.ProcessGuid,
                    "guid": hit.process.entity_id,
                    //"date": data.UtcTime,
                    "date": hit.event.created,
                    "_id": hits[index]._id
                };
                // results.push(hit.event_data);
                tmp['type'] = Utils.eventid_to_decription(hit.winlog.event_id);
                switch (tmp['type']) {
                    case 'create_process':
                        //tmp['process'] = data.ParentImage;
                        tmp['process'] = hit.process.parent.name;
                        //tmp['disp'] = data.CommandLine;
                        //tmp['disp'] = data.CommandLine;
                        tmp['disp'] = hit.process.args;
                        tmp['info'] = {
                            'CurrentDirectory': data.CurrentDirectory,
                            'CommandLine': data.CommandLine,
                            'Hashes': data.Hashes,
                            'ParentProcessGuid': data.ParentProcessGuid,
                            'ParentCommandLine': data.ParentCommandLine,
                            'ProcessGuid': data.ProcessGuid
                        };
                        break;
                    case 'create_file':
                        tmp['process'] = data.Image;
                        tmp['disp'] = data.TargetFilename;
                        tmp['info'] = {
                            'ProcessGuid': data.ProcessGuid
                        };
                        break;
                    case 'registory':
                        tmp['process'] = data.Image;
                        tmp['disp'] = data.TargetObject;
                        tmp['info'] = {
                            'EventType': data.EventType,
                            'ProcessGuid': data.ProcessGuid
                        };
                        break;
                    case 'net':
                        //tmp['process'] = data.Image;
                        tmp['process'] = hit.process.executable;
                        //tmp['disp'] = data.Protocol + ':' + data.DestinationIp + ':' + data.DestinationPort;
                        tmp['disp'] = hit.network.transport + ':' + hit.destination.ip + ':' + hit.destination.port;
                        tmp['ip'] = hit.destination.ip;
                        tmp['port'] = hit.destination.port;
                        tmp['info'] = {
                            'SourceHostname': hit.source.domain,
                            'ProcessGuid': hit.process.entity_id,
                            //'SourceIsIpv6': hit.data.SourceIsIpv6,
                            'SourceIp': hit.source.ip,
                            'DestinationHostname': hit.destination.domain
                        };
                        break;
                    case 'remote_thread':
                        tmp['process'] = data.SourceImage;
                        tmp['disp'] = data.TargetImage;
                        tmp['info'] = {
                            'SourceProcessGuid': data.SourceProcessGuid,
                            'StartAddress': data.StartAddress,
                            'TargetProcessGuid': data.TargetProcessGuid
                        };
                        break;
                    case 'file_create_time':
                        tmp['process'] = hit.process.executable;
                        //tmp['disp'] = data.TargetFilename;
                        tmp['disp'] = hit.file.path;
                        tmp['info'] = {
                            'CreationUtcTime': data.CreationUtcTime,
                            'PreviousCreationUtcTime': data.PreviousCreationUtcTime
                        };
                        break;
                    case 'image_loaded':
                        tmp['process'] = data.Image;
                        tmp['disp'] = data.ImageLoaded;
                        tmp['info'] = {
                            'Hashes': data.Hashes
                        };
                        break;
                    case 'wmi':
                        if (hit.winlog.event_id == 19) {
                            tmp['process'] = data.Name+":"+ data.EventNamespace;
                            tmp['disp'] =  data.Query;
                        }else if(hit.winlog.event_id == 20){
                            tmp['process'] =  data.Name;
                            tmp['disp'] =  data.Destination;
                        }else if(hit.winlog.event_id == 21){
                            tmp['process'] = data.Consumer;
                            tmp['disp'] = data.Filter;
                        }

                        tmp['info'] = {
                            'User': data.User
                        };
                        break;
                }
                results.push(tmp);
            }

            // console.log( JSON.stringify(root, null, '\t') );
            return results;
        }
        return;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Process Chain
    async process(hostname, date, searchObj, callback) {
        var parent = this;
        var searchObj2 = null;
        if(searchObj==null){
            if (date.length === 23) {
                var date_dict = Utils.get_range_datetime(date);
                searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "computer_name.keyword": hostname
                                    }
                                },
                                {
                                    "match": {
                                        "event_id": 1
                                    }
                                },
                                {
                                    "range": {
                                        "@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    "_source": ["record_number", "event_data"]
                };

                searchObj2 = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "computer_name.keyword": hostname,
                                    }
                                },
                                {
                                    "terms": {
                                        "event_id": [3],
                                    }
                                },
                                {
                                    "range": {
                                        "@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    "_source": ["record_number", "event_data", "event_id"]
                };

            } else {
                searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "computer_name.keyword": hostname
                                    }
                                },
                                {
                                    "match": {
                                        "event_id": 1
                                    }
                                },
                                {
                                    "match": {
                                        "@timestamp": date
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    "_source": ["record_number", "event_data"]
                };
            }
        }


        function get_datas(datas) {
            function make_process_list(el_result) {
                var hits = el_result.hits.hits;

                var process_array = {};
                var p_process_array = {};

                for (var index in hits) {
                    var item = hits[index]._source;

                    var key = item['event_data']['ProcessGuid'];
                    var pkey = item['event_data']['ParentProcessGuid'];

                    var net_info = {};
                    if( key in nerworkInfo ) {
                        var tmp_net_info = nerworkInfo[ key ];
                        for (var tmp_port in tmp_net_info) {
                            net_info[tmp_port] = tmp_net_info[tmp_port].length;
                        }
                    }

                    item['index'] = (index + 1)*10000;
                    item['key'] = key;
                    item['pkey'] = pkey;

                    var tmp = {
                        "index": item.index,
                        "key": item.key,
                        "pkey": item.pkey,
                        "number": item.record_number,
                        "level": item.event_data.IntegrityLevel,
                        "curdir": item.event_data.CurrentDirectory,
                        "image": item.event_data.Image,
                        "cmd": item.event_data.CommandLine,
                        "guid": item.event_data.ProcessGuid,
                        "date": item.event_data.UtcTime,
                        "info": {
                            'CurrentDirectory': item.event_data.CurrentDirectory,
                            'CommandLine': item.event_data.CommandLine,
                            'Hashes': item.event_data.Hashes,
                            'ParentImage': item.event_data.ParentImage,
                            'ParentProcessGuid': item.event_data.ParentProcessGuid,
                            'ParentCommandLine': item.event_data.ParentCommandLine,
                            'ProcessGuid': item.event_data.ProcessGuid,
                            'Net': net_info,
                            'Image': item.event_data.Image
                        },
                        "_id": hits[index]._id
                    };
                    process_array[key] = tmp;
                    if (pkey in p_process_array) {
                        p_process_array[pkey].push(tmp);
                    } else {
                        p_process_array[pkey] = [];
                        p_process_array[pkey].push(tmp);
                    }
                }

                return [process_array, p_process_array]
            }

            function find_root_process(cur, list, p_list, index) {
                while (true) {
                    var tmp_key = cur['pkey'];

                    var tmp = {
                        "index": index,
                        "key": tmp_key,
                        "pkey": "",
                        "number": -1,
                        "level": '',
                        "curdir": '',
                        "image": cur.info.ParentImage,
                        "guid": cur.info.ParentProcessGuid,
                        "date": '',
                        "info": {
                            'CurrentDirectory': '',
                            'CommandLine': cur.info.ParentCommandLine,
                            'ProcessGuid': cur.info.ParentProcessGuid,
                            'Hashes': '',
                            'ParentProcessGuid': '',
                            'ParentCommandLine': '',
                            'Net': {},
                            'Image': cur.info.ParentImage
                        },
                        "_id": cur._id
                    };

                    if (tmp_key in p_list) {
                        if (tmp_key in list) {
                            cur = list[tmp_key];
                        } else {
                            return tmp;
                        }
                    } else {
                        return tmp;
                    }
                }
            }

            function make_process_tree(cur, list, p_list) {
                if (cur.current != null && cur.current.key != null) {
                    var key = cur.current.key;
                    delete list[key];

                    for (var index in p_list[key]) {
                        var tmp = {
                            'current': p_list[key][index],
                            'parent': cur.current,
                            'child': []
                        }
                        cur.child.push(tmp);
                        make_process_tree(tmp, list, p_list);
                    }
                }
            }

            var tmp = make_process_list(datas);
            var process_array = tmp[0];
            var p_process_array = tmp[1];

            var system_root_obj = {
                "index": 1,
                "key": "root",
                "pkey": "",
                "number": -1,
                "level": '',
                "curdir": '',
                "image": "root",
                "guid": "root",
                "date": '',
                "info": {
                    'CurrentDirectory': '',
                    'CommandLine': "root",
                    'ProcessGuid': "root",
                    'Hashes': '',
                    'ParentProcessGuid': '',
                    'ParentCommandLine': '',
                    'Net': {},
                    'Image': "root"
                }
            };
            var system_root = {
                'current': system_root_obj,
                'parent': null,
                'child': []
            }

            var process_tree = [];
            process_tree.push(system_root);

            var index = 2;
            for (var key_index in process_array) {
                var item = process_array[key_index];
                var tmp = find_root_process(item, process_array, p_process_array, index);

                var root = {
                    'current': tmp,
                    'parent': null,
                    'child': []
                }
                make_process_tree(root, process_array, p_process_array);
                system_root.child.push( root );

                index += 1;
            }

            // console.log( JSON.stringify(root, null, '\t') );
            callback(process_tree);
        }

        var nerworkInfo = {};
        function get_net_datas(datas) {
            for( var index in datas ) {
                var item = datas[ index ];
                if( (item.guid in nerworkInfo) == false ) {
                    nerworkInfo[ item.guid ] = {};
                }
                if( (item.port in nerworkInfo[ item.guid ]) == false ) {
                    nerworkInfo[ item.guid ][ item.port ] = [];
                }
                if ( (item.ip in nerworkInfo[ item.guid ][ item.port ]) == false ) {
                    nerworkInfo[ item.guid ][ item.port ].push( item.ip );
                }
            }
            parent.search(searchObj, get_datas);
        }
        this.process_list(hostname, "net", date, searchObj2, get_net_datas);
    }

    async process_start_end(hostname, date, start_time, end_time, searchObj, callback) {
        var parent = this;
        var searchObj2 = null;
        if(searchObj==null){
            if (date.length === 10) {
                var date_dict = Utils.get_range_datetime3(start_time, end_time);
                searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "computer_name.keyword": hostname
                                    }
                                },
                                {
                                    "match": {
                                        "event_id": 1
                                    }
                                },
                                {
                                    "range": {
                                        "@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    "_source": ["record_number", "event_data"]
                };

                searchObj2 = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "computer_name.keyword": hostname,
                                    }
                                },
                                {
                                    "terms": {
                                        "event_id": [3],
                                    }
                                },
                                {
                                    "range": {
                                        "@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    "_source": ["record_number", "event_data", "event_id"]
                };

            } else {
                searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                    "match": {
                                        "computer_name.keyword": hostname
                                    }
                                },
                                {
                                    "match": {
                                        "event_id": 1
                                    }
                                },
                                {
                                    "match": {
                                        "@timestamp": date
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }],
                    "_source": ["record_number", "event_data"]
                };
            }
        }


        function get_datas(datas) {
            function make_process_list(el_result) {
                var hits = el_result.hits.hits;

                var process_array = {};
                var p_process_array = {};

                for (var index in hits) {
                    var item = hits[index]._source;

                    var key = item['event_data']['ProcessGuid'];
                    var pkey = item['event_data']['ParentProcessGuid'];

                    var net_info = {};
                    if( key in nerworkInfo ) {
                        var tmp_net_info = nerworkInfo[ key ];
                        for (var tmp_port in tmp_net_info) {
                            net_info[tmp_port] = tmp_net_info[tmp_port].length;
                        }
                    }

                    item['index'] = (index + 1)*10000;
                    item['key'] = key;
                    item['pkey'] = pkey;

                    var tmp = {
                        "index": item.index,
                        "key": item.key,
                        "pkey": item.pkey,
                        "number": item.record_number,
                        "level": item.event_data.IntegrityLevel,
                        "curdir": item.event_data.CurrentDirectory,
                        "image": item.event_data.Image,
                        "cmd": item.event_data.CommandLine,
                        "guid": item.event_data.ProcessGuid,
                        "date": item.event_data.UtcTime,
                        "info": {
                            'CurrentDirectory': item.event_data.CurrentDirectory,
                            'CommandLine': item.event_data.CommandLine,
                            'Hashes': item.event_data.Hashes,
                            'ParentImage': item.event_data.ParentImage,
                            'ParentProcessGuid': item.event_data.ParentProcessGuid,
                            'ParentCommandLine': item.event_data.ParentCommandLine,
                            'ProcessGuid': item.event_data.ProcessGuid,
                            'Net': net_info,
                            'Image': item.event_data.Image
                        },
                        "_id": hits[index]._id
                    };
                    process_array[key] = tmp;
                    if (pkey in p_process_array) {
                        p_process_array[pkey].push(tmp);
                    } else {
                        p_process_array[pkey] = [];
                        p_process_array[pkey].push(tmp);
                    }
                }

                return [process_array, p_process_array]
            }

            function find_root_process(cur, list, p_list, index) {
                while (true) {
                    var tmp_key = cur['pkey'];

                    var tmp = {
                        "index": index,
                        "key": tmp_key,
                        "pkey": "",
                        "number": -1,
                        "level": '',
                        "curdir": '',
                        "image": cur.info.ParentImage,
                        "guid": cur.info.ParentProcessGuid,
                        "date": '',
                        "info": {
                            'CurrentDirectory': '',
                            'CommandLine': cur.info.ParentCommandLine,
                            'ProcessGuid': cur.info.ParentProcessGuid,
                            'Hashes': '',
                            'ParentProcessGuid': '',
                            'ParentCommandLine': '',
                            'Net': {},
                            'Image': cur.info.ParentImage
                        },
                        "_id": cur._id
                    };

                    if (tmp_key in p_list) {
                        if (tmp_key in list) {
                            cur = list[tmp_key];
                        } else {
                            return tmp;
                        }
                    } else {
                        return tmp;
                    }
                }
            }

            function make_process_tree(cur, list, p_list) {
                if (cur.current != null && cur.current.key != null) {
                    var key = cur.current.key;
                    delete list[key];

                    for (var index in p_list[key]) {
                        var tmp = {
                            'current': p_list[key][index],
                            'parent': cur.current,
                            'child': []
                        }
                        cur.child.push(tmp);
                        make_process_tree(tmp, list, p_list);
                    }
                }
            }

            var tmp = make_process_list(datas);
            var process_array = tmp[0];
            var p_process_array = tmp[1];

            var system_root_obj = {
                "index": 1,
                "key": "root",
                "pkey": "",
                "number": -1,
                "level": '',
                "curdir": '',
                "image": "root",
                "guid": "root",
                "date": '',
                "info": {
                    'CurrentDirectory': '',
                    'CommandLine': "root",
                    'ProcessGuid': "root",
                    'Hashes': '',
                    'ParentProcessGuid': '',
                    'ParentCommandLine': '',
                    'Net': {},
                    'Image': "root"
                }
            };
            var system_root = {
                'current': system_root_obj,
                'parent': null,
                'child': []
            }

            var process_tree = [];
            process_tree.push(system_root);

            var index = 2;
            for (var key_index in process_array) {
                var item = process_array[key_index];
                var tmp = find_root_process(item, process_array, p_process_array, index);

                var root = {
                    'current': tmp,
                    'parent': null,
                    'child': []
                }
                make_process_tree(root, process_array, p_process_array);
                system_root.child.push( root );

                index += 1;
            }

            // console.log( JSON.stringify(root, null, '\t') );
            callback(process_tree);
        }

        var nerworkInfo = {};
        function get_net_datas(datas) {
            for( var index in datas ) {
                var item = datas[ index ];
                if( (item.guid in nerworkInfo) == false ) {
                    nerworkInfo[ item.guid ] = {};
                }
                if( (item.port in nerworkInfo[ item.guid ]) == false ) {
                    nerworkInfo[ item.guid ][ item.port ] = [];
                }
                if ( (item.ip in nerworkInfo[ item.guid ][ item.port ]) == false ) {
                    nerworkInfo[ item.guid ][ item.port ].push( item.ip );
                }
            }
            parent.search(searchObj, get_datas);
        }
        this.process_list(hostname, "net", date, searchObj2, get_net_datas);
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Process Chain
    async process_overview(hostname, date, guid) {
        var parent = this;

        var searchObj = {
            "size": 1000,
            "query": {
                "bool": {
                    "must": [{
                        "bool":{
                            "must": [{
                                "match": {
                                    "event_id": 1
                                }
                            },
                            {
                                "match": {
                                    "computer_name.keyword": hostname
                                }
                            }]
                        }
                    }
                    ,{
                        "bool": {
                            "should": [{
                                "bool": {
                                    "must": [{
                                        "match": {
                                            "event_data.ProcessGuid.keyword": guid
                                        }
                                    }]
                                 }},
                                 {
                                     "bool": {
                                         "must": [{
                                             "match": {
                                                 "@timestamp": date
                                             }
                                         }]
                                      }
                                 }
                            ]
                        }
                    }]
                }
            },
            "sort": [{
                "@timestamp": "asc"
            }]
        };

        const el_result = await this.process(hostname, date, searchObj, create_info);

        if (el_result) {

            // TARGET Process Chain( root )
            var guids = [];
            var target_root = null;
            for (var index in el_result) {
                var process_tree = el_result[index];
                target_root = search_target(process_tree);
                if (target_root != null) {
                    break;
                }
            }

            // Child Process GUIDS
            get_guid(target_root, guids);
            sub_process_infos();

            function search_target(el_result) {
                if (el_result.current != null && el_result.current.guid == guid) {
                    return el_result;
                }

                for (var index in el_result.child) {
                    var item = el_result.child[index];
                    var tmp = search_target(item);
                    if (tmp != null) return tmp;
                }

                return null;
            }

            function get_guid(target, guids) {
                if (target != null && target.current != null && target.current.guid != null) {
                    guids.push(target.current.guid);
                    for (var index in target.child) {
                        var item = target.child[index];
                        get_guid(item);
                    }
                }
            }

            // Search Process Info
            function sub_process_infos() {
                var searchObj = {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [{
                                "bool":{
                                    "must": [{
                                        "match": {
                                            "@timestamp": date
                                        }
                                    },
                                    {
                                        "match": {
                                            "computer_name.keyword": hostname
                                        }
                                    }]
                                }
                            }
                            ,{
                                "bool": {
                                    "should": [{
                                        "bool": {
                                            "must": [{
                                                "match": {
                                                    "event_data.ProcessGuid.keyword": guid
                                                }
                                            },
                                            {
                                                "terms": {
                                                    "event_id": [11, 12, 13, 3, 2, 7, 19, 20, 21]
                                                }
                                            }]
                                         }},
                                         {
                                             "bool": {
                                                 "must": [{
                                                     "match": {
                                                         "event_data.SourceProcessGuid.keyword": guid
                                                     }
                                                 },
                                                 {
                                                     "terms": {
                                                         "event_id": [8]
                                                     }
                                                 }]
                                              }
                                         }
                                    ]
                                }
                            }]
                        }
                    },
                    "sort": [{
                        "@timestamp": "asc"
                    }]
                };

                function make_process_infos(result) {
                    // KEY: GUID
                    // VALUE: EVENT DATA
                    var info_array = {};
                    var info_net_array = {};
                    var info_create_file_array = {};
                    var info_create_file_time_array = {};
                    var hits = result.hits.hits;
                    for (var index in hits) {
                        var item = hits[index]._source;
                        var _id = hits[index]._id;

                        if (item.event_id==3){
                            if ((item.event_data.ProcessGuid in info_array) == false) {
                                info_array[item.event_data.ProcessGuid] = [];
                                info_create_file_array[item.event_data.ProcessGuid] = [];
                                info_create_file_time_array[item.event_data.ProcessGuid] = [];
                                info_net_array[item.event_data.ProcessGuid] = {};
                            }

                            if ((item.event_data.DestinationPort in info_net_array[item.event_data.ProcessGuid]) == false) {
                                info_net_array[item.event_data.ProcessGuid][item.event_data.DestinationPort] = [];
                            }
                            if( info_net_array[item.event_data.ProcessGuid][item.event_data.DestinationPort].length == parseInt( config.max_object_num ) ) {
                                var tmp = {
                                    id: item.event_id,
                                    data: item.event_data,
                                    type: 'alert',
                                    _id: _id
                                };
                                info_array[item.event_data.ProcessGuid].push(tmp);
                                info_net_array[item.event_data.ProcessGuid][item.event_data.DestinationPort].push(tmp);
                            } else if( info_net_array[item.event_data.ProcessGuid][item.event_data.DestinationPort].length < parseInt( config.max_object_num ) ) {
                                var tmp = {
                                    id: item.event_id,
                                    data: item.event_data,
                                    type: 'normal',
                                    _id: _id
                                };
                                info_array[item.event_data.ProcessGuid].push(tmp);
                                info_net_array[item.event_data.ProcessGuid][item.event_data.DestinationPort].push(tmp);
                            }
                        } else if (item.event_id==2){
                            if ((item.event_data.ProcessGuid in info_array) == false) {
                                info_array[item.event_data.ProcessGuid] = [];
                                info_create_file_array[item.event_data.ProcessGuid] = [];
                                info_create_file_time_array[item.event_data.ProcessGuid] = [];
                                info_net_array[item.event_data.ProcessGuid] = {};
                            }

                            if( info_create_file_time_array[item.event_data.ProcessGuid].length == parseInt( config.max_object_num ) ) {
                                var tmp = {
                                    id: item.event_id,
                                    data: item.event_data,
                                    type: 'alert',
                                    _id: _id
                                };
                                info_array[item.event_data.ProcessGuid].push(tmp);
                                info_create_file_time_array[item.event_data.ProcessGuid].push(tmp);
                            } else if( info_create_file_time_array[item.event_data.ProcessGuid].length < parseInt( config.max_object_num ) ) {
                                var tmp = {
                                    id: item.event_id,
                                    data: item.event_data,
                                    type: 'normal',
                                    _id: _id
                                };
                                info_array[item.event_data.ProcessGuid].push(tmp);
                                info_create_file_time_array[item.event_data.ProcessGuid].push(tmp);
                            }
                        } else if (item.event_id==11){
                            if ((item.event_data.ProcessGuid in info_array) == false) {
                                info_array[item.event_data.ProcessGuid] = [];
                                info_create_file_array[item.event_data.ProcessGuid] = [];
                                info_create_file_time_array[item.event_data.ProcessGuid] = [];
                                info_net_array[item.event_data.ProcessGuid] = {};
                            }

                            if( info_create_file_array[item.event_data.ProcessGuid].length == parseInt( config.max_object_num ) ) {
                                var tmp = {
                                    id: item.event_id,
                                    data: item.event_data,
                                    type: 'alert',
                                    _id: _id
                                };
                                info_array[item.event_data.ProcessGuid].push(tmp);
                                info_create_file_array[item.event_data.ProcessGuid].push(tmp);
                            } else if( info_create_file_array[item.event_data.ProcessGuid].length < parseInt( config.max_object_num ) ) {
                                var tmp = {
                                    id: item.event_id,
                                    data: item.event_data,
                                    type: 'normal',
                                    _id: _id
                                };
                                info_array[item.event_data.ProcessGuid].push(tmp);
                                info_create_file_array[item.event_data.ProcessGuid].push(tmp);
                            }
                        } else if (item.event_id!=8){
                            if ((item.event_data.ProcessGuid in info_array) == false) {
                                info_array[item.event_data.ProcessGuid] = [];
                                info_create_file_array[item.event_data.ProcessGuid] = [];
                                info_create_file_time_array[item.event_data.ProcessGuid] = [];
                                info_net_array[item.event_data.ProcessGuid] = {};
                            }
                            var tmp = {
                                id: item.event_id,
                                data: item.event_data,
                                type: 'normal',
                                _id: _id
                            };
                            info_array[item.event_data.ProcessGuid].push(tmp);
                        }else{
                            if ((item.event_data.SourceProcessGuid in info_array) == false) {
                                info_array[item.event_data.SourceProcessGuid] = [];
                                info_create_file_array[item.event_data.SourceProcessGuid] = [];
                                info_create_file_time_array[item.event_data.SourceProcessGuid] = [];
                                info_net_array[item.event_data.SourceProcessGuid] = {};
                            }
                            var tmp = {
                                id: item.event_id,
                                data: item.event_data,
                                type: 'normal',
                                _id: _id
                            };
                            info_array[item.event_data.SourceProcessGuid].push(tmp);
                        }

                    }

                    function add_process_info(target) {
                        if(target){
                            if (target.current != null && target.current.guid != null && target.current.guid in info_array) {
                            	target.current['infos'] = info_array[target.current.guid];
                            }
                            for (var index in target.child) {
                                var item = target.child[index];
                                add_process_info(item);
                            }
                        }
                    }
                    add_process_info(target_root);

                    callback(target_root);
                }

                //parent.search(searchObj, make_process_infos);
                const result = Search.search(searchObj);
                make_process_infos(result);
            }


        }

        return;
        
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Process Detail Info
    async process_detail(hostname, date, guid, callback) {
        var searchObj = {
            "size": 10000,
            "query": {
                "bool": {
                    "must": [{
                        "bool":{
                            "must": [
                            {
                                "match": {
                                    "computer_name.keyword": hostname
                                }
                            }]
                        }
                    }
                    ,{
                        "bool": {
                            "should": [{
                                "bool": {
                                    "must": [{
                                        "match": {
                                            "@timestamp": date
                                        }
                                    },{
                                        "match": {
                                            "event_data.ProcessGuid.keyword": guid
                                        }
                                    },
                                    {
                                        "terms": {
                                            "event_id": [11, 12, 13, 3, 2, 7, 19, 20, 21]
                                        }
                                    }]
                                 }},
                                 {
                                     "bool": {
                                         "must": [{
                                             "match": {
                                                 "@timestamp": date
                                             }
                                         },{
                                             "match": {
                                                 "event_data.SourceProcessGuid.keyword": guid
                                             }
                                         },
                                         {
                                             "terms": {
                                                 "event_id": [8]
                                             }
                                         }]
                                      }
                                 },
                                 {
                                     "bool": {
                                         "must": [{
                                             "match": {
                                                 "event_data.ProcessGuid.keyword": guid
                                             }
                                         },
                                         {
                                             "terms": {
                                                 "event_id": [1]
                                             }
                                         }]
                                      }
                                 }
                            ]
                        }
                    }]
                }
            },
            "sort": [{
                "@timestamp": "asc"
            }]
        };

        function get_datas(el_result) {
            var results = [];
            var hits = el_result.hits.hits;
            for (var index in hits) {
                var hit = hits[index]._source;

                var tmp = {
                    "number": hit.record_number,
                    "image": '',
                    "guid": '',
                    "date": '',
                    "_id": hits[index]._id
                };
                if ("Image" in hit.event_data) {
                    tmp["image"] = hit.event_data.Image;
                }
                if ("ProcessGuid" in hit.event_data) {
                    tmp["guid"] = hit.event_data.ProcessGuid;
                }
                if ("UtcTime" in hit.event_data) {
                    tmp["date"] = hit.event_data.UtcTime;
                }

                if (hit.event_id == 1) {
                    tmp['type'] = 'create_process';
                    tmp['process'] = hit.event_data.ParentImage;
                    tmp['disp'] = hit.event_data.CommandLine;
                    tmp['info'] = {
                        'CurrentDirectory': hit.event_data.CurrentDirectory,
                        'CommandLine': hit.event_data.CommandLine,
                        'Hashes': hit.event_data.Hashes,
                        'ParentProcessGuid': hit.event_data.ParentProcessGuid,
                        'ParentCommandLine': hit.event_data.ParentCommandLine,
                        'ProcessGuid': hit.event_data.ProcessGuid,
                        'Image': hit.event_data.Image
                    };
                } else if (hit.event_id == 11) {
                    tmp['type'] = 'create_file';
                    tmp['process'] = hit.event_data.Image;
                    tmp['disp'] = hit.event_data.TargetFilename;
                    tmp['info'] = {
                        'ProcessGuid': hit.event_data.ProcessGuid,
                        'TargetFilename': hit.event_data.TargetFilename,
                        'Image': hit.event_data.Image
                    };
                } else if ((hit.event_id == 12) || (hit.event_id == 13)) {
                    tmp['type'] = 'registory';
                    tmp['process'] = hit.event_data.Image;
                    tmp['disp'] = hit.event_data.TargetObject;
                    tmp['info'] = {
                        'EventType': hit.event_data.EventType,
                        'ProcessGuid': hit.event_data.ProcessGuid,
                        'TargetObject': hit.event_data.TargetObject,
                        'Image': hit.event_data.Image,
                        'Details': hit.event_data.Details
                    };
                } else if (hit.winlog.event_id == 3) {
                    let data = hit.winlog.event_data;
                    tmp['type'] = 'net';
                    tmp['process'] = data.Image;
                    tmp['disp'] = data.Protocol + ':' + data.DestinationIp + ':' + data.DestinationPort;
                    tmp['info'] = {
                        'SourceHostname': data.SourceHostname,
                        'ProcessGuid': data.ProcessGuid,
                        'SourceIsIpv6': data.SourceIsIpv6,
                        'SourceIp': data.SourceIp,
                        'DestinationPort:': data.DestinationPort,
                        'DestinationHostname:': data.DestinationHostname,
                        'DestinationIp': data.DestinationIp,
                        'DestinationIsIpv6': data.DestinationIsIpv6
                    };

                    /*
                    tmp['process'] = hit.event_data.Image;
                    tmp['disp'] = hit.event_data.Protocol + ':' + hit.event_data.DestinationIp + ':' + hit.event_data.DestinationPort;
                    tmp['info'] = {
                        'SourceHostname': hit.event_data.SourceHostname,
                        'ProcessGuid': hit.event_data.ProcessGuid,
                        'SourceIsIpv6': hit.event_data.SourceIsIpv6,
                        'SourceIp': hit.event_data.SourceIp,
                        'DestinationPort:': hit.event_data.DestinationPort,
                        'DestinationHostname:': hit.event_data.DestinationHostname,
                        'DestinationIp': hit.event_data.DestinationIp,
                        'DestinationIsIpv6': hit.event_data.DestinationIsIpv6
                    };
                    */
                } else if (hit.event_id == 8) {
                    tmp['type'] = 'remote_thread';
                    tmp['process'] = hit.event_data.SourceImage;
                    tmp['disp'] = hit.event_data.TargetImage;
                    tmp['info'] = {
                        'SourceProcessGuid': hit.event_data.SourceProcessGuid,
                        'StartAddress': hit.event_data.StartAddress,
                        'TargetProcessGuid': hit.event_data.TargetProcessGuid,
                        'TargetImage': hit.event_data.TargetImage,
                        'SourceImage': hit.event_data.SourceImage
                    };
                } else if (hit.event_id == 2) {
                    tmp['type'] = 'file_create_time';
                    tmp['process'] = hit.event_data.Image;
                    tmp['disp'] = hit.event_data.TargetFilename;
                    tmp['info'] = {
                        'Image': hit.event_data.Image,
                        'CreationUtcTime': hit.event_data.CreationUtcTime,
                        'PreviousCreationUtcTime': hit.event_data.PreviousCreationUtcTime
                    };
                } else if (hit.event_id == 7) {
                    tmp['type'] = 'image_loaded';
                    tmp['process'] = hit.event_data.Image;
                    tmp['disp'] = hit.event_data.ImageLoaded;
                    tmp['info'] = {
                        'Image': hit.event_data.Image,
                        'ImageLoaded': hit.event_data.ImageLoaded,
                        'Hashes': hit.event_data.Hashes
                    };
                } else if (hit.event_id == 19) {
                    tmp['type'] = 'wmi';
                    tmp['process'] = hit.event_data.Name+":"+hit.event_data.EventNamespace;
                    tmp['disp'] = hit.event_data.Query;
                    tmp['info'] = {
                        'User': hit.event_data.User
                    };
                } else if (hit.event_id == 20) {
                    tmp['type'] = 'wmi';
                    tmp['process'] = hit.event_data.Name;
                    tmp['disp'] = hit.event_data.Destination;
                    tmp['info'] = {
                        'User': hit.event_data.User
                    };
                } else if (hit.event_id == 21) {
                    tmp['type'] = 'wmi';
                    tmp['process'] = hit.event_data.Consumer;
                    tmp['disp'] = hit.event_data.Filter;
                    tmp['info'] = {
                        'User': hit.event_data.User
                    };
                } else {
                    tmp['type'] = 'other';
                    tmp['process'] = tmp["image"];
                    tmp['disp'] = '';
                    tmp['info'] = {};
                }
                results.push(tmp);
            }
            callback(results);
        }
        this.search(searchObj, get_datas);
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Event Histgram
    async events(data) {
        var searchObj = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [{
                        "match": {
                            "winlog.computer_name.keyword": data.hostname
                        }
                    }, {
                        "range": {
                            "@timestamp": data.period
                        }
                    }]
                }
            },
            "aggs": {
                "group_by": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "interval": "1d",
                        "format": "yyyy-MM-dd"
                    },
                    "aggs": {
                        "event_id": {
                            "terms": {
                                "field": "winlog.event_id",
                                "size" : 100000
                            }
                        }
                    }
                }
            }
        };
        const el_result = await Search.search(searchObj);
        if (el_result){
            // event_id = 1: Create Process
            // event_id = 11: Create File
            // event_id = 12 or 13 or 14: Registory
            // event_id = 3: Net Access
            // event_id = 8: RemoteThread
            var results = [];
            var hits = el_result.aggregations.group_by.buckets;
            for (var index in hits) {
                var item = hits[index];
                var create_process = 0;
                var create_file = 0;
                var registory = 0;
                var net_access = 0;
                var remote_thread = 0;
                var file_create_time = 0;
                var image_loaded = 0;
                var wmi = 0;
                var other = 0;
                for (var i in item['event_id']['buckets']) {
                    var event = item['event_id']['buckets'][i];
                    if (event['key'] == 1) {
                        create_process += event['doc_count'];
                    } else if (event['key'] == 11) {
                        create_file += event['doc_count'];
                    } else if ((event['key'] == 12) || (event['key'] == 13)) {
                        registory += event['doc_count'];
                    } else if (event['key'] == 3) {
                        net_access += event['doc_count'];
                    } else if (event['key'] == 8) {
                        remote_thread += event['doc_count'];
                    } else if (event['key'] == 2) {
                        file_create_time += event['doc_count'];
                    } else if (event['key'] == 7) {
                        image_loaded += event['doc_count'];
                    } else if (event['key'] == 19 || event['key'] == 20 || event['key'] == 21) {
                        wmi += event['doc_count'];
                    } else {
                        other += event['doc_count'];;
                    }
                }
                var tmp = {
                    "date": item['key_as_string'],
                    "result": {
                        "create_process": create_process,
                        "create_file": create_file,
                        "registory": registory,
                        "net": net_access,
                        "remote_thread": remote_thread,
                        "file_create_time": file_create_time,
                        "image_loaded": image_loaded,
                        "wmi": wmi,
                        "other": other
                    }
                };
                results.push(tmp);
            }
            return results;
        }
        return;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Event
    async event(hostname, date) {
        var searchObj = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [{
                            "match": {
                                "winlog.computer_name.keyword": hostname
                            }
                        },
                        {
                            "match": {
                                "@timestamp": date
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "group_by": {
                    "date_histogram": {
                        "field": "@timestamp",
                        "interval": "1d",
                        "format": "yyyy-MM-dd"
                    },
                    "aggs": {
                        "event_id": {
                            "terms": {
                                "field": "winlog.event_id",
                                "size" : 100000
                            }
                        }
                    }
                }
            }
        };

        const el_result = await Search.search(searchObj);

        if (el_result) {
            // event_id = 1: Create Process
            // event_id = 11: Create File
            // event_id = 12 or 13 or 14: Registory
            // event_id = 3: Net Access
            // event_id = 8: RemoteThread
            var results = [];
            var hits = el_result.aggregations.group_by.buckets;

            for (var index in hits) {
                var item = hits[index];
                var create_process = 0;
                var create_file = 0;
                var registory = 0;
                var net_access = 0;
                var remote_thread = 0;
                var file_create_time = 0;
                var image_loaded = 0;
                var wmi = 0;
                var other = 0;
                for (var i in item['event_id']['buckets']) {
                    var event = item['event_id']['buckets'][i];
                    if (event['key'] == 1) {
                        create_process += event['doc_count'];
                    } else if (event['key'] == 11) {
                        create_file += event['doc_count'];
                    } else if ((event['key'] == 12) || (event['key'] == 13) || (event['key'] == 14)) {
                        registory += event['doc_count'];
                    } else if (event['key'] == 3) {
                        net_access += event['doc_count'];
                    } else if (event['key'] == 8) {
                        remote_thread += event['doc_count'];
                    } else if (event['key'] == 2) {
                    	file_create_time += event['doc_count'];
                    } else if (event['key'] == 7) {
                        image_loaded += event['doc_count'];
                    } else if (event['key'] == 19 || event['key'] == 20 || event['key'] == 21) {
                        wmi += event['doc_count'];
                    } else {
                        other += event['doc_count'];
                    }
                }
                var tmp = {
                    "date": item['key_as_string'],
                    "result": {
                        "create_process": create_process,
                        "create_file": create_file,
                        "registory": registory,
                        "net": net_access,
                        "remote_thread": remote_thread,
                        "file_create_time": file_create_time,
                        "image_loaded": image_loaded,
                        "wmi": wmi,
                        "other": other
                    }
                };
                results.push(tmp);
            }
            return results;
        }
        return;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get Dashboard
    async dashboard(data) {
        var searchObj = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [{
                        "range": {
                            "@timestamp": data.query
                        }
                    }]
                }
            },
            "aggs": {
                "by_image_asc": {
                    "terms": {
                        "field": "statistics_data.Image.keyword",
                        "order" : { "_count" : "asc" },
                        "size": 100
                    }
                },
                "by_image_desc": {
                    "terms": {
                        "field": "statistics_data.Image.keyword",
                        "order" : { "_count" : "desc" },
                        "size": 100
                    }
                },
                "by_DestinationIp_asc": {
                    "terms": {
                        "field": "statistics_data.DestinationIp.keyword",
                        "order" : { "_count" : "asc" },
                        "size": 100
                    }
                },
                "by_DestinationIp_desc": {
                    "terms": {
                        "field": "statistics_data.DestinationIp.keyword",
                        "order" : { "_count" : "desc" },
                        "size": 100
                    }
                },
                "by_eventtype": {
                    "terms": {
                        "field": "statistics_data.EventType.keyword",
                        "order" : { "_count" : "asc" },
                        "size": 100
                    }
                },
                "by_DestinationPort": {
                    "terms": {
                        "field": "statistics_data.DestinationPort.keyword",
                        "order" : { "_count" : "asc" },
                        "size": 100
                    }
                }
           }
        };

        const el_result = this.search_statistical(searchObj);

        var results = {};
        var keys=["by_image_asc","by_image_desc","by_DestinationIp_asc","by_DestinationIp_desc","by_eventtype","by_DestinationPort"];
        for (var key in keys) {
            if(el_result.aggregations != null && keys[key] in el_result["aggregations"]){
                results[keys[key]] = el_result["aggregations"][keys[key]]["buckets"];
            }else{
                results[keys[key]] = [];
            }

        }
        if(el_result.hits!=null){
            results["total"] = el_result["hits"]["total"];
        }
        return results;

    }
    // ----------------------------------------------

    // ----------------------------------------------
    async sm_search(params) {
        //var search_items_and_date_query = this.make_query(params)
        var search_items_and_date_query = makeQuery(params);

        var sort_item = {};
        sort_item[params.sort_item] = params.sort_order;
        var sort = [];
        sort.push(sort_item);

        var searchObj = {
            "size": 100,
            "query": {
                "bool": {
                    "must": search_items_and_date_query
                }
            },
            //"sort": sort,
            //"_source": ["record_number", "event_id", "level", "event_record_id", "computer_name", "user", "event_data", "@timestamp"]
            "_source": ["destination", "event", "log", "process", "source", "winlog", "@timestamp"]

        };

        /*
        const util = require('util');
        console.log('########------------ query -------------########');
        console.log(util.inspect(searchObj, {
            depth: null
        }));
        */

        const el_result = await Search.search(searchObj);
        console.log(JSON.stringify(el_result));
        var results = [];
        var results_count = 0;
        //if (el_result !== null) {
        if ("hits" in el_result) {
            results_count = el_result.hits.total;
            var hits = el_result.hits.hits;
            console.log(JSON.stringify(hits));
            for (var index in hits) {
                var hit = hits[index]._source;
                var decription = Utils.eventid_to_decription(hit.event_id);
                var tmp = {
                    //"number": hit.record_number,
                    "number": hit.winlog.record_id,
                    //"utc_time": hit.event_data.UtcTime,
                    "utc_time": hit.event.created,
                    "event_id": hit.winlog.event_id,
                    "level": hit.log.level,
                    "computer_name": hit.winlog.computer_name,
                    "user_name": hit.winlog.user.name,
                    //"image": hit.event_data.Image,
                    "image": hit.process?hit.process.executable:"",
                    "date": hit["@timestamp"],
                    //"process_guid": hit.event_data.ProcessGuid,
                    //"process_guid": hit.process.entity_id,
                    "decription" : decription,
                    "_id" : hits[index]._id
                };

                if(hit.event_id == 8){
                    tmp["source_guid"]=hit.event_data.SourceProcessGuid;
                }

                results.push(tmp);
            }
        }

        const res = {
            "total": results_count,
            "hits": results
        };
        return res;

    }
    //----------------------------------------------

    //----------------------------------------------
    async sm_unique_hosts(params) {

        //var search_items_and_date_query = this.make_query(params)
        var search_items_and_date_query = makeQuery(params);

        var uniqueHostObj = {
            "size": 0,
            "query": {
                "bool": {
                    "must": search_items_and_date_query
                }
            },
            "aggs": {
                "unique_hosts": {
                    "terms": {
                        "field": "winlog.computer_name.keyword"
                    }
                }
            }
        };

        const el_result = await Search.search(uniqueHostObj);
        console.log(JSON.stringify(el_result));
        if (el_result) {
            var unique_hosts = el_result.aggregations.unique_hosts.buckets;
            return unique_hosts;
        }
        return;
    }
    //----------------------------------------------

    //----------------------------------------------
    make_query(params) {
        console.log(JSON.stringify(params))
        var search_items_and_date_query = [];
        var search_items_and_eventid_querys = [];
        var event_id_list = [1, 11, 12, 13, 3, 8, 2, 7];
        var search_form_exist_flg = false;

        for (var event_id of event_id_list) {

            var search_items = [];
            for (var form_name in params) {
                if (form_name.substr(0, "search_item_".length) === "search_item_" &&
                    typeof params[form_name] !== "undefined" && params[form_name] !== null) {

                    search_form_exist_flg = true;
                    var num = form_name.substr("search_item_".length);
                    var key = "";
                    if (event_id == 1) {
                        if (params[form_name] == "4") {
                            key = "event_data.Image.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else if (params[form_name] == "8") {
                            key = "event_data.Hashes.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    } else if (event_id == 11) {
                        if (params[form_name] == "4") {
                            key = "event_data.Image.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else if (params[form_name] == "5") { 
                            key = "event_data.TargetFilename.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    } else if ([12, 13].indexOf(event_id) >= 0) {
                        if (params[form_name] == "4") { 
                            key = "event_data.Image.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else if (params[form_name] == "6") { 
                            key = "event_data.TargetObject.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else if (params[form_name] == "7") { 
                            key = "event_data.Details.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    } else if (event_id == 3) {
                        if (params[form_name] == "1") { 
//                            if ("search_value_"+num in params && typeof params["search_value_"+num] !== "undefined") {
//                                search_items.push({
//                                    "bool": {
//                                        "should": [{
//                                            "multi_match": {
//                                                "query": params["search_value_"+num].toLowerCase(),
//                                                "type": "cross_fields",
//                                                "fields": ["event_data.DestinationIp", "event_data.DestinationPort"],
//                                                "operator": "and"
//                                            }
//                                        },
//                                        {
//                                            "multi_match": {
//                                                "query": params["search_value_"+num].toLowerCase(),
//                                                "type": "cross_fields",
//                                                "fields": ["event_data.DestinationIsIpv6", "event_data.DestinationPort"],
//                                                "operator": "and"
//                                            }
//                                        }]
//                                    }
//                                });
//                            }
                            if ("search_value_"+num in params && typeof params["search_value_"+num] !== "undefined") {
                                search_items.push({
                                    "bool": {
                                        "should": [{
                                            "wildcard": {
                                                "event_data.DestinationIp.keyword": "*" + this.str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                            }
                                        },
                                        {
                                            "wildcard": {
                                                "event_data.DestinationIpv6.keyword": "*" + this.str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                            }
                                        }]
                                    }
                                });
                            }
                        } else if (params[form_name] == "2") { 
                            key = "event_data.DestinationPort.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else if (params[form_name] == "3") { 
                            key = "winlog.event_data.DestinationHostname.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    } else if (event_id == 8) {
                        if (params[form_name] == "4") { 
                            if ("search_value_" + num in params && typeof params["search_value_" + num] !== "undefined") {
                                search_items.push({
                                    "bool": {
                                        "should": [{
                                                "wildcard": {
                                                    "event_data.TargetImage.keyword": "*" + this.str_escape(params["search_value_" + num].toLowerCase()) + "*"
                                                }
                                            },
                                            {
                                                "wildcard": {
                                                    "event_data.SourceImage.keyword": "*" + this.str_escape(params["search_value_" + num].toLowerCase()) + "*"
                                                }
                                            }
                                        ]
                                    }
                                });
                            }
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    } else if (event_id == 2) {
                        if (params[form_name] == "4") { 
                            key = "event_data.Image.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    } else if (event_id == 7) {
                        if (params[form_name] == "4") { 
                            if ("search_value_"+num in params && typeof params["search_value_"+num] !== "undefined") {
                                search_items.push({
                                    "bool": {
                                        "should": [{
                                            "wildcard": {
                                                "event_data.Image.keyword": "*" + this.str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                            }
                                        },
                                        {
                                            "wildcard": {
                                                "event_data.ImageLoaded.keyword": "*" + this.str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                            }
                                        }]
                                    }
                                });
                            }
                        } else if (params[form_name] == "8") {
                            key = "event_data.Hashes.keyword";
                            search_items = this.set_wildcard_value(search_items, key, params, num);
                        } else {
                            if (params.search_conjunction === 1) {
                                search_items = [];
                                break;
                            }
                        }
                    }
                }
            }

            if (search_items.length !== 0) {
                var search_items_query = {};
                if (params.search_conjunction === 1) {
                    search_items_query = {
                        "bool": {
                            "must": search_items
                        }
                    };
                } else if (params.search_conjunction === 2) {
                    search_items_query = {
                        "bool": {
                            "should": search_items
                        }
                    };
                } else {
                    search_items_query = {
                        "bool": {
                            "should": search_items
                        }
                    };
                }

                search_items_and_eventid_querys.push({
                    "bool": {
                        "must": [{
                                "match": {
                                    "winlog.event_id": event_id
                                }
                            },
                            search_items_query
                        ]
                    }
                });
            }
        }

        if (search_items_and_eventid_querys.length === 0 && search_form_exist_flg) {
            search_items_and_eventid_querys = [{
                "match": {
                    "winlog.event_id": 9999
                }
            }];
        }

        search_items_and_date_query.push({
            "bool": {
                "should": search_items_and_eventid_querys
            }
        });

        if (("fm_start_date" in params && typeof params.fm_start_date !== "undefined") ||
            ("fm_end_date" in params && typeof params.fm_end_date !== "undefined")) {

            var timestamp_range = {};
            if ("fm_start_date" in params && typeof params.fm_start_date !== "undefined") {
                timestamp_range["gte"] = params.fm_start_date;
            }
            if ("fm_end_date" in params && typeof params.fm_end_date !== "undefined") {
                timestamp_range["lte"] = params.fm_end_date;
            }
            search_items_and_date_query.push({
                "range": {
                    "@timestamp": timestamp_range
                }
            });
        }

        return search_items_and_date_query;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    set_wildcard_value(search_items, key, params, num) {
        var match = {};
        if ("search_value_" + num in params && typeof params["search_value_" + num] !== "undefined") {
            match[key] = "*" + this.str_escape(params["search_value_" + num].toLowerCase()) + "*";
            search_items.push({
                "wildcard": match
            });
        }

        return search_items;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    str_escape(str) {
        if(str == null || typeof str === "undefined") {
            return "";
        }
        var entityMap = {
            "\\" : "\\\\",
            "\"" : "\\\"",
            "\'" : "\\\'"
        };

        return String(str).replace(/[\\\"\']/g, function(s) {
            return entityMap[s];
        });
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: Get alert
    alert_data(data) {
        var sort_item = {};
        sort_item[data.sort_item] = data.sort_order;
        var sort = [];
        sort.push(sort_item);
        var searchObj = {
            "size": 10000,
            "query": {
                "bool": {
                    "must": [{
                        "range": {
                            "@timestamp": data.query
                        }
                    }]
                }
            },
            "aggs": {
                "unique_hosts": {
                    "terms": {
                            "field": "computer_name.keyword",
                            "size" : 100000
                    }
                },
                "tabledata": {
                    "terms": {
                        "field": "rule.file_name.keyword",
                        "size" : 100000
                    },
                    "aggs": {
                        "hosts": {
                            "terms": {
                                "field": "computer_name.keyword",
                                "size" : 100000
                            }
                        }
                    }
                }
            },
            "sort": sort,
            "_source": ["record_number", "event_id", "level", "event_record_id", "computer_name", "user", "event_data", "@timestamp", "rule", "original_id"]
        };

        const el_result = this.search_alert(searchObj);

        var results = [];
        var results_count = 0;
        var unique_hosts = [];
        var tabledata = [];
        if (el_result !== null) {
            if(el_result.hits != null){

                results_count = el_result.hits.total;
                var hits = el_result.hits.hits;
                for (var index in hits) {
                    var hit = hits[index]._source;
                    var decription = Utils.eventid_to_decription(hit.event_id);
                    var tmp = {
                        "number": hit.record_number,
                        "utc_time": hit.event_data.UtcTime,
                        "event_id": hit.event_id,
                        "level": hit.level,
                        "computer_name": hit.computer_name,
                        "user_name": hit.event_data.User,
                        "image": hit.event_data.Image,
                        "date": hit["@timestamp"],
                        "rule": hit.rule,
                        "process_guid": hit.event_data.ProcessGuid,
                        "decription": decription,
                        "rule_name": hit.rule[0].file_name,
                        "_id" : hit.original_id
                    };

                    if(hit.event_id == 8){
                        tmp["source_guid"]=hit.event_data.SourceProcessGuid;
                    }

                    results.push(tmp);
                }
            }
            if(el_result.aggregations != null){
                unique_hosts = el_result.aggregations.unique_hosts.buckets;
                tabledata = el_result.aggregations.tabledata.buckets;
            }
        }

        const response = {
            "total": results_count,
            "hits": results,
            "unique_hosts": unique_hosts,
            "table_data" : tabledata
        };
        return response;
    }

    alert_host(data, callback) {
        var uniqueHostObj = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [{
                        "range": {
                            "@timestamp": data.query
                        }
                    }]
                }
            },
            "aggs": {
                "unique_hosts": {
                    "terms": {
                        "field": "computer_name.keyword",
                        "size" : 100000
                    }
                }
            }
        };

        function get_datas(el_result) {
        	var unique_hosts = [];
        	if(el_result.aggregations != null){
        		unique_hosts = el_result.aggregations.unique_hosts.buckets;
        	}
            callback(unique_hosts);
        }
        this.search_alert(uniqueHostObj, get_datas);
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: get search keywords from STIX/IoC analyze server using upload file.
    import_search_keywords(params, callback) {
        var request = require('request');

//        var url = 'http://localhost:56020' + params.part_url;
        var url = 'http://' + config.import_server_url + ':' + config.import_server_port + params.part_url;
        var formData = {
            file: {
                value: new Buffer(params.contents),
                options: {
                    filename: params.filename,
                    contentType: params.contenttype
                }
            }
        };

        const util = require('util');
        const sprintf = require('sprintf-js').sprintf;
        console.log("#---------- request to STIX/IoC analyze server ----------");
        const req_str = sprintf('{ url: \'%1$s\', formData: { file: { value: <...>, options: { filename: \'%2$s\', contentType: \'%3$s\' }  } } }', url, params.filename, params.contenttype);
        console.log(req_str);

        request.post({
            url: url,
            formData: formData
        }, function(error, response) {
            console.log("#---------- response from STIX/IoC analyze server ----------");
            if (error) {
                console.error(util.inspect(error));
                callback(error);
            } else {
                var res = {
                    'status': response.statusCode,
                    'message': response.statusMessage,
                    'data': response.body
                };
                console.log(res);
                callback(res);
            }
        });
    }
    // ----------------------------------------------

    // ----------------------------------------------
    // I/F Function: save rules for collecting alert information.
    async save_alert_rules(params) {
        const util = require('util');
        //console.log(util.inspect(params));

        var filename = create_rule_filename();
        var fullpath = this.create_fullpath(config.savepath, filename);
        //console.log(fullpath);

        const fs = require('fs');
        const sprintf = require('sprintf-js').sprintf;

        try {
            fs.writeFileSync(fullpath, JSON.stringify(params, null, 2));

            console.log("#---------- save search criteria/success ----------");
            var res = {
                'status': 200,
                'result': sprintf('succeeded to save rules in "%1$s".', fullpath)
            };
            console.log(res);

            return res;

        } catch (e) {
            console.error("#---------- save search criteria/fail ----------");
            console.error(util.inspect(e));
            return e;
        }


        function padding(n, d, p) {
            p = p || '0';
            return (p.repeat(d) + n).slice(-d);
        };

        function create_rule_filename() {
            const sprintf = require('sprintf-js').sprintf;

            var date = new Date(Date.now());
            var year = padding(date.getFullYear(), 4, "0"),
                month = padding(date.getMonth()+1, 2, "0"),
                day = padding(date.getDate(), 2, "0"),
                hour = padding(date.getHours(), 2, "0"),
                min = padding(date.getMinutes(), 2, "0"),
                second = padding(date.getSeconds(), 2, "0"),
                millsec = padding(date.getMilliseconds(), 3, "0");

            var filename = sprintf('rule-%1$s%2$s%3$s%4$s%5$s%6$s%7$s.json', year, month, day, hour, min, second, millsec);
            return filename;
        };

    }
    // ----------------------------------------------

    // ----------------------------------------------
    async get_alert_rule_file_list(params) {
        const fs = require('fs');
        const path = require('path');
        var self = this;
        var conf_dir = path.join(__dirname, path.dirname(CONFIG_PATH));
        var savepath = config.savepath;
        if (!path.isAbsolute(savepath)) {
            savepath = path.join(conf_dir, savepath);
        }
        console.log(`savepath: ${savepath}`);
        const result = fs.readdir(savepath, function(err, files){
            if (err){
                console.error("#---------- Acquisition of file list failed ----------");
                console.log(err);
                //callback([]);
                return;
            }
            var fileList = files.filter(function(file){
                return fs.statSync(self.create_fullpath(config.savepath,file)).isFile();
            })

            return fileList;
        });
        return result;
    }
    // ----------------------------------------------

    // ----------------------------------------------
    async delete_alert_rule_file(params) {
        if(params.filename == null || params.filename == ""){
            return -1;
        }
        const fs = require('fs');
        const path = require('path');

        var basename = path.basename(params.filename);
        var filepath = this.create_fullpath(config.savepath, basename);

        const result = await fs.unlink(filepath, function(err, files){
            if (err){
                console.error("#---------- Failed to delete rule file ----------");
                console.log(err);
                //callback(-1);
                return -1;
            }
            //callback(1);
            return 1;
        });
        return result;
    }
    // ----------------------------------------------

    create_fullpath(savepath, filename) {
        const path = require('path');
        var conf_dir = path.join(__dirname, path.dirname(CONFIG_PATH));
        //console.log("savepath:", savepath, "/filename:", filename, "/basedir:", conf_dir);
        if (path.isAbsolute(savepath)) {
            return path.join(savepath, filename);
        } else {
            return path.join(conf_dir, savepath, filename);
        }
    };
}
