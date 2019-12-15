const process = require('./process');

async function add_process_info(target, info_array) {
  if(target){
    if (target.current != null && target.current.guid != null && target.current.guid in info_array) {
      target.current['infos'] = info_array[target.current.guid];
    }
    for (var index in target.child) {
       var item = target.child[index];
       target = await add_process_info(item, info_array);
    }
  }
  return target;
}

async function make_process_infos(result, target_root) {
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
  target_root = await add_process_info(target_root, info_array);
  return target_root;
}
            
async function sub_process_infos(client, hostname, date, guid) {
  // Search Process Info
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
    "sort": [{"@timestamp": "asc"}]
  };

  const el_result = await client.search({
    index: 'winlogbeat-*',                                                                                           
    // size: 1000,
    body: searchObj
  });

  return el_result;
}


async function process_overview(client, hostname, date, guid) {
  var parent = this;
  // search pc's create_process has guid on date
  var query = {
    "bool": {
      "must": [
      {
        "bool":{
          "must": [{
            "match": {"event_id": 1}
          },{
            "match": {"computer_name.keyword": hostname}
          }]
        }
      },{
        "bool": {
          "should": [{
            "bool": {
              "must": [{
                "match": {"event_data.ProcessGuid": guid}
              }]
            }
          },{
            "bool": {
              "must": [{
                "match": {"@timestamp": date}
              }]
            }
          }]
        }
      }]
    }
  }
  var searchObj = {
    "size": 1000,
    "query": query,
    "sort": [{"@timestamp": "asc"}]
  };

  const el_result = await process(client, hostname, date, searchObj);
  //return create_info(proc_result);

  //function create_info(el_result, guid) {
  // TARGET Process Chain( root )
  var target_root = null;
  for (var index in el_result) {
    var process_tree = el_result[index];
    target_root = await search_target(process_tree, guid);
    if (target_root != null) {
      break;
    }
  }

  // Child Process GUIDS
  var guids = [];
  guids = await get_guid(target_root, guids);

  const search_result = await sub_process_infos(client, hostname, date, guid);
  const proc_info = await make_process_infos(search_result, target_root);
  return proc_info;
  //return info;
  //}
}

async function search_target(el_result, guid) {
  /*
  el_result = {
    current: {
      guid:,
      infos:
    },
    child:[item]
  }
  */
  if (el_result.current != null && el_result.current.guid == guid) {
    return el_result;
  }

  for (var index in el_result.child) {
    var item = el_result.child[index];
    var tmp = await search_target(item, guid);
    if (tmp != null) return tmp;
  }

  return null;
}

async function get_guid(target, guids) {
  if (target != null && target.current != null && target.current.guid != null) {
    guids.push(target.current.guid);
    for (var index in target.child) {
      var item = target.child[index];
      guids = await get_guid(item, guids);
    }
  }
  return guids;
}

module.exports = process_overview;
