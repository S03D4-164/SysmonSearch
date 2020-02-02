import React, { Component, Fragment } from 'react';

import {
  EuiTabbedContent,
  EuiTitle,
  EuiText,
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
            </EuiTitle>
            <EuiText>
            </EuiText>
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
        autoFocus="selected"
        onTabClick={tab => {
          console.log('clicked tab', tab);
        }}
      />
    );
  }
}

//export default SysmonSearchTabs;
