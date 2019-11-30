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

async function make_process_list(el_result, nerworkInfo) {
  var hits = el_result.hits.hits;
  console.log("hits: " + JSON.stringify(hits));
  var process_array = {};
  var p_process_array = {};

  for (var index in hits) {
    var item = hits[index]._source;
    console.log(item);

    var key = item['event_data']['ProcessGuid'];
    item['key'] = key;

    var pkey = item['event_data']['ParentProcessGuid'];
    item['pkey'] = pkey;

    var net_info = {};
    if( key in nerworkInfo ) {
      var tmp_net_info = nerworkInfo[ key ];
      for (var tmp_port in tmp_net_info) {
        net_info[tmp_port] = tmp_net_info[tmp_port].length;
      }
    }

    item['index'] = (index + 1)*10000;
    var info = {
      'CurrentDirectory': item.event_data.CurrentDirectory,
      'CommandLine': item.event_data.CommandLine,
      'Hashes': item.event_data.Hashes,
      'ParentImage': item.event_data.ParentImage,
      'ParentProcessGuid': item.event_data.ParentProcessGuid,
      'ParentCommandLine': item.event_data.ParentCommandLine,
      'ProcessGuid': item.event_data.ProcessGuid,
      'Net': net_info,
      'Image': item.event_data.Image
     };
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
  //return [process_array, p_process_array]
  const data = await get_datas(process_array, p_process_array)
  return data;
}

//function get_datas(datas) {
async function get_datas(process_array, p_process_array) {
  //var tmp = make_process_list(datas);
  //var process_array = tmp[0];
  //var p_process_array = tmp[1];

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
    var tmp = await find_root_process(item, process_array, p_process_array, index);

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

async function process(client, hostname, date, searchObj) {
  var parent = this;
  var searchObj2 = null;
  if(searchObj==null){
    if (date.length === 23) {
      var date_dict = Utils.get_range_datetime(date);
      var range = {
        "@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }
      };
      searchObj = {
        "size": 10000,
        "query": {
          "bool": { "must": 
            [
              {
                "match": {"winlog.computer_name.keyword": hostname}
              },{
                "match": {"winlog.event_id": 1}
              },{
                //"range": {"@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }}
                "range": range
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        "_source": ["record_number", "event_data"]
      };
      searchObj2 = {
        "size": 10000,
        "query": {
          "bool": {"must": 
            [
              {
                "match": {"winlog.computer_name.keyword": hostname}
              },{
                "terms": {"winlog.event_id": [3]}
              },{
                //"range": {"@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }}
                "range": range
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        "_source": ["record_number", "event_data", "event_id"]
      };

    } else {
      searchObj = {
        "size": 10000,
        "query": {
          "bool": {"must": 
            [
              {
                "match": {"winlog.computer_name.keyword": hostname}
              },{
                "match": {"winlog.event_id": 1}
              },{
                "match": {"@timestamp": date}
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data"]
        "_source": ["winlog.record_id", "winlog.event_data"]
      };
    }
  }

  var nerworkInfo = {
    //guid: {port:[ip]}
  };
  //this.process_list(hostname, "net", date, searchObj2, get_net_datas);
  const datas = await processList(client, hostname, "net", date, searchObj2)
  console.log("datas: " +datas);
  //function get_net_datas(datas) {
  if(datas){
    for( var index in datas ) {
      var item = datas[ index ];
      console.log("item: " + item);
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
    const el_result = await client.search({
      index: 'winlogbeat-*',
      // size: 1000,
      body: searchObj
    });
    console.log("el_result: " + JSON.stringify(el_result));
    const process_tree = await make_process_list(el_result, nerworkInfo);
    //const process_tree = get_datas(process_list);
    return process_tree;
  }
  return;
}

module.exports = process;
