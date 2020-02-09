import React, { Component, Fragment } from 'react';

import {
  EuiTabbedContent,
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui';

import { SysmonEvents } from "./ss_events";
import { SSDatePicker } from "./date_picker";

export class SysmonSearchTabs extends Component {
  constructor(props) {
    super(props);

    this.tabs = [
      {
        id: 'events',
        name: 'Events',
        content: (
          <Fragment>
            <EuiSpacer />
            <SSDatePicker />
            <SysmonEvents />
          </Fragment>
        ),
      },
      {
        id: 'search',
        name: 'Search',
        content: (
          <Fragment>
            <EuiSpacer />
            <EuiTitle>
              <h3>Search</h3>
            </EuiTitle>
          </Fragment>
        ),
      },
      {
        id: 'alert',
        name: 'Alert',
        content: (
              <h3>Alert</h3>
        ),
      },
    ];
  }

  render() {
    return (
      <EuiTabbedContent
        tabs={this.tabs}
        initialSelectedTab={this.tabs[0]}
        autoFocus="selected"
        onTabClick={tab => {
          console.log(this.props);
        }}
      />
    );
  }
}

