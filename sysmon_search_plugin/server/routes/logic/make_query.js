function set_wildcard_value(search_items, key, params, num) {
    var match = {};
    if ("search_value_" + num in params && typeof params["search_value_" + num] !== "undefined") {
        match[key] = "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*";
        search_items.push({
            "wildcard": match
        });
    }

    return search_items;
}

function str_escape(str) {
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

module.exports = {

  make_query(params) {
    console.log("make query: " +JSON.stringify(params));
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
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else if (params[form_name] == "8") {
                        key = "event_data.Hashes.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else {
                        if (params.search_conjunction === 1) {
                            search_items = [];
                            break;
                        }
                    }
                } else if (event_id == 11) {
                    if (params[form_name] == "4") {
                        key = "event_data.Image.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else if (params[form_name] == "5") { 
                        key = "event_data.TargetFilename.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else {
                        if (params.search_conjunction === 1) {
                            search_items = [];
                            break;
                        }
                    }
                } else if ([12, 13].indexOf(event_id) >= 0) {
                    if (params[form_name] == "4") { 
                        key = "event_data.Image.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else if (params[form_name] == "6") { 
                        key = "event_data.TargetObject.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else if (params[form_name] == "7") { 
                        key = "event_data.Details.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
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
                                            "event_data.DestinationIp.keyword": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                        }
                                    },
                                    {
                                        "wildcard": {
                                            "event_data.DestinationIpv6.keyword": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                        }
                                    }]
                                }
                            });
                        }
                    } else if (params[form_name] == "2") { 
                        key = "destination.port.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
                    } else if (params[form_name] == "3") { 
                        key = "destination.domain.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
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
                                                "event_data.TargetImage.keyword": "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*"
                                            }
                                        },
                                        {
                                            "wildcard": {
                                                "event_data.SourceImage.keyword": "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*"
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
                        search_items = set_wildcard_value(search_items, key, params, num);
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
                                            "event_data.Image.keyword": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                        }
                                    },
                                    {
                                        "wildcard": {
                                            "event_data.ImageLoaded.keyword": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                                        }
                                    }]
                                }
                            });
                        }
                    } else if (params[form_name] == "8") {
                        key = "event_data.Hashes.keyword";
                        search_items = set_wildcard_value(search_items, key, params, num);
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
}