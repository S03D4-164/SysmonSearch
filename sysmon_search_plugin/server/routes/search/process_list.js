const Utils = require('./Utils');

async function processList(client, hostname, eventtype, date, searchObj) {
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
                                    "event.code": [1, 11, 12, 13, 3, 8, 2, 7, 19, 20, 21],
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
                                        "event.code": event_id,
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

  const el_result = await client.search({
    index: 'winlogbeat-*',                                                                                           
    // size: 1000,
    body: searchObj
  });
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

module.exports = processList;
