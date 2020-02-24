import React, { Component, Fragment } from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import {
  EuiTabbedContent,
  EuiTitle,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

import { SysmonEvents } from "./ss_events";
import { SysmonSearch } from "./ss_search";
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
            <SysmonEvents />
          </Fragment>
        ),
      },
      {
        id: 'search',
        name: 'Search',
        content: (
          <Fragment>
            <SysmonSearch />
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

