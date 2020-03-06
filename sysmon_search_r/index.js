import { resolve } from 'path';
import { existsSync } from 'fs';

import Route from './server/routes/sysmon_search';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'sysmon_search_r',
    uiExports: {
      app: {
        title: 'SysmonSearch R',
        description: 'An awesome Kibana plugin',
        main: 'plugins/sysmon_search_r/app',
      },
      hacks: [
        'plugins/sysmon_search_r/hack'
      ],
      styleSheetPaths: [resolve(__dirname, 'public/app.scss'), resolve(__dirname, 'public/app.css')].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      Route(server);
    }
  });
}
