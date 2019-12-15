const request = require('request-promise');
const CONFIG_PATH = '../../conf.js';
import {conf as config} from '../../conf.js';
const util = require('util');
const sprintf = require('sprintf-js').sprintf;

async function importSearchKeywords(params) {
  console.log(params);
  //var url = 'http://localhost:56020' + params.part_url;
  var url = 'http://' + config.import_server_url + ':' + config.import_server_port + params.part_url;
  var formData = {
    file: {
      value: new Buffer.from(params.contents),
      options: {
        filename: params.filename,
        contentType: params.contenttype
      }
    }
  };
  console.log("#---------- request to STIX/IoC analyze server ----------");
  const req_str = sprintf(
    '{ url: \'%1$s\', formData: { file: { value: <...>, options: { filename: \'%2$s\', contentType: \'%3$s\' }  } } }',
    url, params.filename, params.contenttype
  );
  console.log(req_str);
  const result = await request.post({
      url: url, formData: formData
    }, 
    function(error, response) {
      console.log("#---------- response from STIX/IoC analyze server ----------");
      if (error) {
        console.error(util.inspect(error));
        return;
      } else {
        var res = {
          'status': response.statusCode,
          'message': response.statusMessage,
          'data': response.body
        };
        console.log(res);
        return res;
      }
    }
  );
  return result;
}

module.exports = importSearchKeywords;
