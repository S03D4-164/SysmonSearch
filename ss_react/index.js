import { resolve } from 'path';
import { existsSync } from 'fs';


import { i18n } from '@kbn/i18n';

import exampleRoute from './server/routes/sysmon_search';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'ss_react',
    uiExports: {
      app: {
        title: 'Ss React',
        description: 'An awesome Kibana plugin',
        main: 'plugins/ss_react/app',
      },
      hacks: [
        'plugins/ss_react/hack'
      ],
      styleSheetPaths: [resolve(__dirname, 'public/app.scss'), resolve(__dirname, 'public/app.css')].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      const xpackMainPlugin = server.plugins.xpack_main;
      if (xpackMainPlugin) {
        const featureId = 'ss_react';

        xpackMainPlugin.registerFeature({
          id: featureId,
          name: i18n.translate('ssReact.featureRegistry.featureName', {
            defaultMessage: 'ss_react',
          }),
          navLinkId: featureId,
          icon: 'questionInCircle',
          app: [featureId, 'kibana'],
          catalogue: [],
          privileges: {
            all: {
              api: [],
              savedObject: {
                all: [],
                read: [],
              },
              ui: ['show'],
            },
            read: {
              api: [],
              savedObject: {
                all: [],
                read: [],
              },
              ui: ['show'],
            },
          },
        });
      }

      // Add server routes and initialize the plugin here
      exampleRoute(server);
    }
  });
}
