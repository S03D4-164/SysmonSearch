async function events(client, hostname, date) {
  var timestamp = {
    "range" : {"@timestamp": date}
  }
  if (typeof date === "string"){
    timestamp = {
      "match" : {"@timestamp": date}
    }
  }
  var searchObj = {
    "size": 0,
    "query": {
      "bool": {
        "must": [
          {
            "match": {"winlog.computer_name.keyword": hostname}
          },
          {
            "match": {"winlog.channel.keyword": "Microsoft-Windows-Sysmon/Operational"}
          },
          timestamp
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

  const el_result = await client.search({
    index: 'winlogbeat-*',                                                                                           
    // size: 1000,
    body: searchObj
  });

  if (el_result){
    console.log(el_result);
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

module.exports = events;
