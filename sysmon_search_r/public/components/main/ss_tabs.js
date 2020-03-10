import React, { Component, Fragment } from 'react';

import {
  EuiTabbedContent,
  EuiTitle,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

import { SysmonEvents } from "./ss_events";
import { SysmonSearch } from "./ss_search";

export class SysmonSearchTabs extends Component {
  constructor(props) {
    super(props);

    this.tabs = [
      {
        id: 'events',
        name: 'Events',
        content: (
            <SysmonEvents />
        ),
      },
      {
        id: 'search',
        name: 'Search',
        content: (
            <SysmonSearch />
        ),
      },
      {
        id: 'alert',
        name: 'Alert',
        content: (
            <Fragment>
            <SysmonEvents />
            <SysmonSearch />
            </Fragment>
        ),
      },
    ];
  }

  render() {
    return (
      <EuiTabbedContent
        tabs={this.tabs}
        initialSelectedTab={this.tabs[0]}
      />
    );
  }
}

