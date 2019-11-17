import {conf as config} from '../../conf.js';
export default function (server) {

  const Sysmon_Search_Logic = require('./Sysmon_Search_Logic');
  var sysmon_search_obj = new Sysmon_Search_Logic(config.elasticsearch_url, config.elasticsearch_port);

  server.route({
    path: '/api/sysmon-search-plugin/hosts',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("hosts params: " + JSON.stringify(params));
      const result = await sysmon_search_obj.hosts(params);
      console.log("hosts result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/events',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("events params: " + JSON.stringify(params));
      const result = await sysmon_search_obj.events(params);
      console.log("events result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/event/{host}/{date}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("event params: " + JSON.stringify(params));
      const result = await sysmon_search_obj.event(params.host, params.date);
      console.log("event result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_list/{host}/{eventtype}/{date}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("event params: " + JSON.stringify(params));
      const result = await sysmon_search_obj.process_list(params.host, params.eventtype, params.date, null);
      console.log("event result: " + JSON.stringify(result));
      return result;

    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process/{host}/{date}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      var query = req.query;
      if ((query.start_time == null) || (query.end_time == null)) {
        const result = await sysmon_search_obj.process(params.host, params.date, null);
        return result;
      } else {
        const result = await sysmon_search_obj.process_start_end(params.host, params.date, query.start_time, query.end_time, null);
        return result;
      }
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_overview/{host}/{date}/{guid}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("process overview params: " + JSON.stringify(params));
      const result = await sysmon_search_obj.process_overview(params.host, params.date, params.guid);
      console.log("process overview result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_detail/{host}/{date}/{guid}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("process detail params: " + JSON.stringify(params));
      const result = await sysmon_search_obj.process_detail(params.host, params.date, params.guid);
      console.log("process detail result: " + JSON.stringify(result));
      return result;

      
    }
  });

  server.route({
	    path: '/api/sysmon-search-plugin/dashboard',
	    method: 'POST',
	    async handler(req) {
	      var params = req.payload;
        console.log("dashboard params: " + JSON.stringify(params));
        const result = await sysmon_search_obj.dashboard(params);
        console.log("dashboard result: " + JSON.stringify(result));
        return result;
      }
	  });


  server.route({
    path: '/api/sysmon-search-plugin/sm_search',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("sm_search params: " +JSON.stringify(params));
      const result = await sysmon_search_obj.sm_search(params);
      console.log("sm_search result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/sm_unique_hosts',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("sm_unique_hosts params: " +JSON.stringify(params));
      const result = await sysmon_search_obj.sm_unique_hosts(params);
      console.log("sm_unique_hosts: " + JSON.stringify(result));
      return result;

    }
  });

  server.route({
	    path: '/api/sysmon-search-plugin/alert_data',
	    method: 'POST',
	    async handler(req) {
	      var params = req.payload;
        console.log("alert_data params: " + JSON.stringify(params));
        const result = await sysmon_search_obj.alert_data(params);
        console.log("alert_data result: " + JSON.stringify(result));
        return result;
	    }
	  });

  server.route({
	    path: '/api/sysmon-search-plugin/alert_host',
	    method: 'POST',
	    async handler(req) {
	      var params = req.payload;
        console.log("alert_host params: " + JSON.stringify(params));
        const result = await sysmon_search_obj.alert_host(params);
        console.log("alert_host result: " + JSON.stringify(result));
        return result;

	    }
	  });

  server.route({
      path: '/api/sysmon-search-plugin/import_search_keywords',
      method: 'POST',
      async handler(request) {
        var params = request.payload;
        const result = await sysmon_search_obj.import_search_keywords(params);
        if (result) {
              const util = require('util');
              if (util.isError(result)) {
                  const Boom = require('boom');
                  var error = Boom.badRequest(util.inspect(result)); // 400
                  //reply(error);
                  return error;
              } else {
                  //reply(result);
                  return result;
              }
        }
        return;
      }
  });

  server.route({
      path: '/api/sysmon-search-plugin/save_alert_rules',
      method: 'POST',
      handler(request) {
          var params = request.payload;
          const result = sysmon_search_obj.save_alert_rules(params);
          const util = require('util');
          if (util.isError(result)) {
              const Boom = require('boom');
              var error = Boom.serverUnavailable(util.inspect(result)); // 503
              return error;
          } else {
              return result;
          }

        }
  });

  server.route({
      path: '/api/sysmon-search-plugin/get_alert_rule_file_list',
      method: 'GET',
      async handler(req) {
          var params = req.params;
          const result = await sysmon_search_obj.get_alert_rule_file_list(params);
          console.log(`get_alert result: ${result}`);
          return result?result:{};
     }
  });

  server.route({
      path: '/api/sysmon-search-plugin/delete_alert_rule_file',
      method: 'POST',
      async handler(req) {
        var params = req.payload;
        const result = await sysmon_search_obj.delete_alert_rule_file(params);
        console.log("delete_alert result: "+ JSON.stringify(result));
        return result;
    }
  });

}

