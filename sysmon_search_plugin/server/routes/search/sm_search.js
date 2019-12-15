const Utils = require('./Utils');
const makeQuery = require('./make_query');

function set_wildcard_value(search_items, key, params, num) {
  var match = {};
  if ("search_value_" + num in params
      && typeof params["search_value_" + num] !== "undefined") {
    match[key] = "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*";
    search_items.push({"wildcard": match});
  }
  return search_items;
}

function str_escape(str) {
    if(str == null || typeof str === "undefined") return "";
    var entityMap = {
        "\\" : "\\\\",
        "\"" : "\\\"",
        "\'" : "\\\'"
    };
    return String(str).replace(/[\\\"\']/g, function(s) {
        return entityMap[s];
    });
}


async function makeQueryOld(params, map) {
  console.log("make query params: " +JSON.stringify(params));
  var search_items_and_date_query = [];
  var search_items_and_eventid_querys = [];
  var event_id_list = [1, 11, 12, 13, 3, 8, 2, 7];
  var search_form_exist_flg = false;

  for (var event_id of event_id_list) {
    var search_items = [];
    for (var form_name in params) {
      if (form_name.substr(0, "search_item_".length) === "search_item_"
        && typeof params[form_name] !== "undefined"
        && params[form_name] !== null)
      {
        search_form_exist_flg = true;
        var num = form_name.substr("search_item_".length);
        var key = "";
        if (event_id == 1) { //create_process
          if (params[form_name] == "4") {
            key = map["Image"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else if (params[form_name] == "8") {
            key = map["Hashes"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else {
            if (params.search_conjunction === 1) {
              search_items = [];
              break;
            }
          }
        } else if (event_id == 11) { //create_file
          if (params[form_name] == "4") {
            key = map["Image"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else if (params[form_name] == "5") { 
            key = map["TargetFilename"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else {
            if (params.search_conjunction === 1) {
              search_items = [];
              break;
            }
          }
        } else if ([12, 13].indexOf(event_id) >= 0) { //registry
          if (params[form_name] == "4") { 
            key = map["Image"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else if (params[form_name] == "6") { 
            key = map["TargetObject"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else if (params[form_name] == "7") { 
            key = map["Details"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else {
            if (params.search_conjunction === 1) {
              search_items = [];
              break;
            }
          }
        } else if (event_id == 3) { //net
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
                    "winlog.event_data.DestinationIp": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                  }
                },
                /*{
                  "wildcard": {
                    "winlog.event_data.DestinationIpv6": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                  }
                */
                ]
              }
            });
          }
          } else if (params[form_name] == "2") { 
            //key = "destination.port.keyword";
            key = map["DestinationPort"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else if (params[form_name] == "3") { 
            key = map["DestinationHostname"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else {
            if (params.search_conjunction === 1) {
              search_items = [];
              break;
            }
          }
        } else if (event_id == 8) {//remote thread
          if (params[form_name] == "4") { 
            if ("search_value_" + num in params && typeof params["search_value_" + num] !== "undefined") {
              search_items.push({
                "bool": {
                  "should": [{
                    "wildcard": {
                      "winlog.event_data.TargetImage": "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*"
                    }
                  },{
                    "wildcard": {
                      "winlog.event_data.SourceImage": "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*"
                    }
                  }]
                }
              });
            }
          } else {
            if (params.search_conjunction === 1) {
              search_items = [];
              break;
            }
          }
        } else if (event_id == 2) {//file create time
          if (params[form_name] == "4") { 
            key = map["Image"];
            search_items = set_wildcard_value(search_items, key, params, num);
          } else {
            if (params.search_conjunction === 1) {
              search_items = [];
              break;
            }
          }
        } else if (event_id == 7) {//image loaded
          if (params[form_name] == "4") { 
            if ("search_value_"+num in params && typeof params["search_value_"+num] !== "undefined") {
              search_items.push({
                "bool": {
                  "should": [{
                    "wildcard": {
                      "winlog.event_data.Image": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                    }
                  },{
                    "wildcard": {
                      "winlog.event_data.ImageLoaded": "*" + str_escape(params["search_value_"+num].toLowerCase()) + "*"
                    }
                  }]
                }
              });
            }
          } else if (params[form_name] == "8") {
            //key = "event_data.Hashes.keyword";
            key = map["Hashes"];
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
          "bool": {"must": search_items}
        };
      } else if (params.search_conjunction === 2) {
        search_items_query = {
          "bool": {"should": search_items}
        };
      } else {
        search_items_query = {
          "bool": {"should": search_items}
        };
      }
      search_items_and_eventid_querys.push({
        "bool": {
          "must": [{
            "match": {"winlog.event_id": event_id}
          },
          search_items_query
          ]
        }
      });
    }
  }

  if (search_items_and_eventid_querys.length === 0 && search_form_exist_flg) {
    search_items_and_eventid_querys = [{
      "match": {"winlog.event_id": 9999}
    }];
  }

  search_items_and_date_query.push({
    "bool": {"should": search_items_and_eventid_querys}
  });

  if (("fm_start_date" in params && typeof params.fm_start_date !== "undefined")
  || ("fm_end_date" in params && typeof params.fm_end_date !== "undefined")) {

    var timestamp_range = {};
    if ("fm_start_date" in params && typeof params.fm_start_date !== "undefined") {
      timestamp_range["gte"] = params.fm_start_date;
    }
    if ("fm_end_date" in params && typeof params.fm_end_date !== "undefined") {
      timestamp_range["lte"] = params.fm_end_date;
    }
    search_items_and_date_query.push({
      "range": {"@timestamp": timestamp_range}
    });
  }
  return search_items_and_date_query;
}

async function smSearch(sysmon, params) {
  const search_items_and_date_query = await makeQuery(params, sysmon.map);

  var sort_item = {};
  sort_item[params.sort_item] = params.sort_order;
  var sort = [];
  sort.push(sort_item);

  var searchObj = {
    "size": 10000,
    "query": {
      "bool": {"must": search_items_and_date_query}
    },
    "sort": sort,
    //"_source": ["record_number", "event_id", "level", "event_record_id", "computer_name", "user", "event_data", "@timestamp"]
    "_source": ["winlog", "log", "@timestamp"]
  };

  const el_result = await sysmon.client.search({
    //index: 'winlogbeat-*',
    index: sysmon.map["defaultindex"],
    // size: 1000,
    body: searchObj
  });
  //console.log(JSON.stringify(el_result));

  var results = [];
  var results_count = 0;
  //if (el_result !== null) {
  if ("hits" in el_result) {
    results_count = el_result.hits.total;
    var hits = el_result.hits.hits;
    //console.log(JSON.stringify(hits));
    for (let index in hits) {
      var hit = hits[index]._source;
      var description = Utils.eventid_to_type(hit.winlog.event_id);
      var tmp = {
        //"number": hit.record_number,
        "number": hit.winlog.record_id,
        "utc_time": hit.winlog.event_data.UtcTime,
        "event_id": hit.winlog.event_id,
        "level": hit.log.level,
        "computer_name": hit.winlog.computer_name,
        "user_name": hit.winlog.user?hit.winlog.user.name:"",
        "image": hit.winlog.event_data.Image,
        "date": hit["@timestamp"],
        "process_guid": hit.winlog.event_data.ProcessGuid,
        "description" : description,
        "_id" : hits[index]._id
      };
      if(hit.event_id == 8)tmp["source_guid"] = hit.winlog.event_data.SourceProcessGuid;
      results.push(tmp);
    }
  }
  //console.log(results);
  const res = {"total": results_count, "hits": results};
  
  return res;
}

module.exports = smSearch;
