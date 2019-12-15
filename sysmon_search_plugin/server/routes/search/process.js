const Utils = require('./Utils');
const processList = require("./process_list");

async function find_root_process(cur, list, p_list, index) {
  while (true) {
    var tmp_key = cur['pkey'];
    var info = {
      'CurrentDirectory': '',
      'CommandLine': cur.info.ParentCommandLine,
      'ProcessGuid': cur.info.ParentProcessGuid,
      'Hashes': '',
      'ParentProcessGuid': '',
      'ParentCommandLine': '',
      'Net': {},
      'Image': cur.info.ParentImage
    };
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
      "info": info,
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

async function make_process_tree(cur, list, p_list) {
  if (cur.current != null && cur.current.key != null) {
    var key = cur.current.key;
    delete list[key];

    for (var index in p_list[key]) {
      var tmp = {
        'current': p_list[key][index],
        'parent': cur.current,
        'child': []
      }
      tmp = await make_process_tree(tmp, list, p_list);
      cur.child.push(tmp);
    }
  }
  return cur;
}

async function make_process_list(el_result, networkInfo) {
  var hits = el_result.hits.hits;
  console.log("hits: " + JSON.stringify(hits));
  var process_array = {};
  var p_process_array = {};

  for (let index in hits) {

    var net_info = {};
    if( key in networkInfo ) {
      var tmp_net_info = networkInfo[ key ];
      for (let tmp_port in tmp_net_info) {
        net_info[tmp_port] = tmp_net_info[tmp_port].length;
      }
    }

    var item = hits[index]._source;
    var data = item.winlog.event_data;
    
    //var key = item['winlog']['event_data']['ProcessGuid'];
    //var pkey = item['winlog']['event_data']['ParentProcessGuid'];
    var key = data.ProcessGuid;
    var pkey = data.ParentProcessGuid;
    
    var info = {
      'CurrentDirectory': data.CurrentDirectory,
      'CommandLine': data.CommandLine,
      'Hashes': data.Hashes,
      'ParentImage': data.ParentImage,
      'ParentProcessGuid': data.ParentProcessGuid,
      'ParentCommandLine': data.ParentCommandLine,
      'ProcessGuid': data.ProcessGuid,
      'Net': net_info,
      'Image': data.Image
    };

    item['index'] = (index + 1)*10000;
    item['key'] = key;
    item['pkey'] = pkey;

    var tmp = {
       "index": item.index,
       "key": item.key,
       "pkey": item.pkey,
       "number": item.winlog.record_id,
       "level": data.IntegrityLevel,
       "curdir": data.CurrentDirectory,
       "image": data.Image,
       "cmd": data.CommandLine,
       "guid": data.ProcessGuid,
       "date": data.UtcTime,
       "info": info,
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
  //const process_tree = await get_datas(process_array, p_process_array)
  //return process_tree;
}

//function get_datas(datas) {
//async function get_datas(process_array, p_process_array) {
async function get_datas(process_list) {
  //var tmp = make_process_list(datas);
  var process_array = process_list[0];
  var p_process_array = process_list[1];

  var info = {
    'CurrentDirectory': '',
    'CommandLine': "root",
    'ProcessGuid': "root",
    'Hashes': '',
    'ParentProcessGuid': '',
    'ParentCommandLine': '',
    'Net': {},
    'Image': "root"
  }
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
    "info": info,
  };
  var system_root = {
    'current': system_root_obj,
    'parent': null,
    'child': []
  };

  var process_tree = [];
  process_tree.push(system_root);

  var index = 2;
  for (var key_index in process_array) {
    var item = process_array[key_index];
    var tmp = await find_root_process(
      item, process_array, p_process_array, index
    );
    var root = {
      'current': tmp,
      'parent': null,
      'child': []
    }
    root = await make_process_tree(root, process_array, p_process_array);
    system_root.child.push( root );

    index += 1;
  }

  // console.log( JSON.stringify(root, null, '\t') );
  //callback(process_tree);
  return process_tree;
}

async function process(sysmon, hostname, date, searchObj) {
  var parent = this;
  var source = [
    sysmon.map["RecordID"],
    sysmon.map["EventData"],
    sysmon.map["EventID"],
  ];
  var host = {};
  host[sysmon.computer_name] = hostname;
  var event_id = {};
  event_id[sysmon.event_id] = 1;
  var searchObj2 = null;
  if(searchObj == null){
    var date_dict = null;
    if (date.length === 23) {
      date_dict = Utils.get_range_datetime(date);
    } else if (sysmon.start_time && sysmon.end_time){
      date_dict = Utils.get_range_datetime3(sysmon.start_time, sysmon.end_time);
    }
    console.log(date_dict);
    if(date_dict){
      var range = {
        "@timestamp": {
         "gte": date_dict["start_date"], "lte": date_dict["end_date"]
        }
      };
      searchObj = {
        "size": 10000,
        "query": {
          "bool": { "must": 
            [
              {
                "match": host
                //{"winlog.computer_name.keyword": hostname}
              },{
                "match": event_id
                //{"winlog.event_id": 1}
              },{
                //"range": {"@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }}
                "range": range
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data"]
        "_source": source
      };
      event_id[sysmon.event_id] = [3];
      searchObj2 = {
        "size": 10000,
        "query": {
          "bool": {"must": 
            [
              {
                "match": host
                //{"winlog.computer_name.keyword": hostname}
              },{
                "terms": event_id
                //{"winlog.event_id": [3]}
              },{
                //"range": {"@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }}
                "range": range
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data", "event_id"]
        "_source": source
      };

    } else {
      searchObj = {
        "size": 10000,
        "query": {
          "bool": {"must": 
            [
              {
                "match": host
                //{"winlog.computer_name.keyword": hostname}
              },{
                "match": event_id
                //{"winlog.event_id": 1}
              },{
                "match": {"@timestamp": date}
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data"]
        "_source": source
      };
    }
  }

  var networkInfo = {
    //guid: {port:[ip]}
  };
  //this.process_list(hostname, "net", date, searchObj2, get_net_datas);
  const datas = await processList(
    sysmon, hostname, "net_access", date, searchObj2
  )
  //console.log(JSON.stringify(searchObj2) + " => " + JSON.stringify(datas));
  //function get_net_datas(datas) {
  if(datas){
    for( let index in datas ) {
      var item = datas[ index ];
      //console.log("item: " + JSON.stringify(item));
      if( (item.guid in networkInfo) == false ) {
        networkInfo[ item.guid ] = {};
      }
      if( (item.port in networkInfo[ item.guid ]) == false ) {
        networkInfo[ item.guid ][ item.port ] = [];
      }
      if ( (item.ip in networkInfo[ item.guid ][ item.port ]) == false ) {
        networkInfo[ item.guid ][ item.port ].push( item.ip );
      }
    }
    const el_result = await sysmon.client.search({
      index: sysmon.index,
      //'winlogbeat-*',
      // size: 1000,
      body: searchObj
    });
    //console.log(JSON.stringify(searchObj) + " => " + JSON.stringify(el_result));
    //console.log("networkInfo: " + JSON.stringify(networkInfo));
    const process_list = await make_process_list(el_result, networkInfo);
    //console.log("process_list: " + JSON.stringify(process_list));
    const process_tree = get_datas(process_list);
    console.log("process_tree: " + JSON.stringify(process_tree));
    return process_tree;
  }
  return;
}

module.exports = process;
