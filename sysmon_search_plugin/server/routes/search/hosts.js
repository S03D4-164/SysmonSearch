async function searchHosts(client, params) {

  console.log("params: " + JSON.stringify(params));

  var search_items_and_date_query = [];
  if (typeof params !== "undefined"
      && params !== null
      && Object.keys(params).length !== 0)
  {
    if ("keyword" in params
        && typeof params.keyword !== "undefined"
        && params.keyword !== "")
    {
      search_items_and_date_query.push({
      "wildcard": {
          "winlog.computer_name.keyword": "*" + params['keyword'].toLowerCase() + "*"
        }
      });
    }
    if (("fm_start_date" in params
         && typeof params.fm_start_date !== "undefined")
         || ("fm_end_date" in params
         && typeof params.fm_end_date !== "undefined")
    ){
       var timestamp_range = {};
       if ("fm_start_date" in params
           && typeof params.fm_start_date !== "undefined")
       {
         timestamp_range["gte"] = params.fm_start_date;
       }

       if ("fm_end_date" in params
           && typeof params.fm_end_date !== "undefined"
       ) {
         timestamp_range["lte"] = params.fm_end_date;
       }

       search_items_and_date_query.push({
         "range": { "@timestamp": timestamp_range }
       });
    }
  }
  console.log(JSON.stringify(search_items_and_date_query));

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

  const el_result = await client.search({
    index: 'winlogbeat-*',                                                                                           
    // size: 1000,
    body: searchObj
  });
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

module.exports = searchHosts;
