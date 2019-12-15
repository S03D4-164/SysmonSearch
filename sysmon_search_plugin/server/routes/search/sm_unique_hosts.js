const makeQuery = require('./make_query');

async function sm_unique_hosts(sysmon, params) {
  //var search_items_and_date_query = this.make_query(params)
  var query = await makeQuery(params, sysmon.map);

  var uniqueHostObj = {
    //"size": 0,
    "query": {
      "bool": {"must": query}
    },
    "aggs": {
      "unique_hosts": {
        "terms": {"field": sysmon.computer_name}
      }
    }
  };
  console.log(uniqueHostObj)
  const el_result = await sysmon.client.search({
    //index: 'winlogbeat-*',                                                                                           
    index: sysmon.map["defaultindex"],
    // size: 1000,
    body: uniqueHostObj
  });

  console.log(JSON.stringify(el_result));
  if (el_result) {
    var unique_hosts = el_result.aggregations.unique_hosts.buckets;
    return unique_hosts;
  }
  return;
}

module.exports = sm_unique_hosts;
