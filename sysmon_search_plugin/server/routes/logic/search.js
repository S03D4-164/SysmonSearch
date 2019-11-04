//const CONFIG_PATH = '../../../conf.js';
import {conf as config} from '../../../conf.js';
import elasticsearch from 'elasticsearch';

const client = new elasticsearch.Client({
    log: 'trace',
    host: config.elasticsearch_url + ':' + config.elasticsearch_port
});

module.exports =  {

    // ----------------------------------------------
    // Common Function: Search Request
    async search(bodyObj) {
        console.log("search: " + JSON.stringify(bodyObj));
        const result = await client.search({
            index: 'winlogbeat-*',
            // size: 1000,
            body: bodyObj
        });

        return result;
    },
    // ----------------------------------------------

    // Common Function: Alert Search Request
    search_alert(bodyObj) {
        const result = this.client.search({
            index: 'sysmon-search-alert-*',
            // size: 1000,
            body: bodyObj
        }, function(error, response) {
            if (!error) {
                // console.log(response);
                //callback(response);
                return response;
            } else {
                console.log(['error', 'elastic-translator'], error);
                //callback(null);
                return;
            }
        });
        return result;
    },
    // Common Function: Statistical Search Request
    search_statistical(bodyObj) {
        const result = this.client.search({
            index: 'sysmon-search-statistics-*',
            // size: 1000,
            body: bodyObj
        }, function(error, response) {
            if (!error) {
                // console.log(response);
                return response;
            } else {
                console.log(['error', 'elastic-translator'], error);
                return;
            }
        });
        return result;
    }
    // ----------------------------------------------
}