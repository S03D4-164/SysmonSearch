const Utils = require('./Utils');

async function getEventIdFromType(type){
  if (type === 'create_process') return [1];
  else if (type === 'file_create_time') return [2];
  else if (type === 'net_access') return [3];
  else if (type === 'image_loaded') return [7];
  else if (type === 'remote_thread') return [8];
  else if (type === 'create_file') return [11];
  else if (type === 'registry') return [12,13,14];
  else if (type === 'wmi') return [19,20,21];
  else return [];
}

async function processList(sysmon, hostname, eventtype, date, searchObj) {
  var host = {};
  host[sysmon.computer_name] = hostname;
  var event_id = {};
  var source = [
    sysmon.map["RecordID"],
    sysmon.map["EventData"],
    sysmon.map["EventID"]
  ];
  if(searchObj==null){
    if (date.length === 23) {
      event_id[sysmon.event_id] = [1, 11, 12, 13, 3, 8, 2, 7, 19, 20, 21];
      var date_dict = Utils.get_range_datetime(date);
      var query = {"bool": {
          "must": [{
            "match": host
            //{"winlog.computer_name": hostname,}
          },{
            "match": sysmon.channel
            //{"winlog.channel": "Microsoft-Windows-Sysmon/Operational",}
          },{
            "terms": event_id
            //{"winlog.event_id": [1, 11, 12, 13, 3, 8, 2, 7, 19, 20, 21],}
          },{
            "range": {"@timestamp": {
              "gte": date_dict["start_date"], "lte": date_dict["end_date"]
            }}
          }]
        }
      };
      searchObj = {
        "size": 10000,
        "query": query,
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data", "event_id"]
        "_source": source
      };
    } else {
      //const event_id = await getEventIdFromType(eventtype);
      event_id[sysmon.event_id] = await getEventIdFromType(eventtype);
      var query = {"bool": {
          "must": [{
            "match": host
            //{"winlog.computer_name": hostname,}
           },{
            "match": sysmon.channel
            //{"winlog.channel": "Microsoft-Windows-Sysmon/Operational",}
           },{
            //"terms": {"event.code": event_id,}
            "terms": event_id
            //{"winlog.event_id": event_id,}
           },{
            "match": {"@timestamp": date}
           }]
        }
      }
      searchObj = {
        "size": 10000,
        "query": query,
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data", "event_id"]
        "_source": source,
      };
    }
  }

  console.log("search: " + JSON.stringify(searchObj));
  const el_result = await sysmon.client.search({
    index: sysmon.index,
    //'winlogbeat-*',
    //size: 1000,
    body: searchObj
  });
  //console.log("el_result: " + JSON.stringify(el_result))
  if (el_result) {
    var hits = el_result.hits.hits;

    var results = [];

    for (var index in hits) {
      var hit = hits[index]._source;
      //console.log("hit: " + JSON.stringify(hit));
      let data = hit.winlog.event_data;
      // results.push( hit );
      var tmp = {
        //"number": hit.record_number,
        "number": hit.winlog.record_id,
        "image": data.Image,
        "guid": data.ProcessGuid,
        "date": data.UtcTime,
        "_id": hits[index]._id
      };
      // results.push(hit.event_data);
      //tmp['type'] = Utils.eventid_to_decription(hit.winlog.event_id);
      tmp['type'] = Utils.eventid_to_type(hit.winlog.event_id);
      //console.log(tmp);
      switch (tmp['type']) {
        case 'create_process':
          tmp['process'] = data.ParentImage;
          tmp['disp'] = data.CommandLine;
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
        case 'registry':
          tmp['process'] = data.Image;
          tmp['disp'] = data.TargetObject;
          tmp['info'] = {
            'EventType': data.EventType,
            'ProcessGuid': data.ProcessGuid
          };
          break;
        case 'net_access':
          tmp['process'] = data.Image;
          tmp['disp'] = data.Protocol + ':' + data.DestinationIp + ':' + data.DestinationPort;
          tmp['ip'] = data.DestinationIp;
          tmp['port'] = data.DestinationPort;
          tmp['info'] = {
            'SourceHostname': data.SourceHostname,
            'ProcessGuid': data.ProcessGuid,
            'SourceIsIpv6': data.SourceIsIpv6,
            'SourceIp': data.SourceIp,
            'DestinationHostname': data.DestinationHostname
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
          tmp['process'] = data.Image;
          tmp['disp'] = data.TargetFilename;
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
    //console.log("process_list results: " + JSON.stringify(results))
    return results;
  }
  return;
}

module.exports = processList;
