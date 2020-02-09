import React from 'react';
import {
  EuiPage,
  EuiPageHeader,
  EuiTitle,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentBody,
  EuiText,
  EuiLink,
} from '@elastic/eui';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import { SysmonSearchTabs } from './ss_tabs';
import { SysmonSummary } from './ss_summary';

export class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
<Router>
<Switch>
<Route exact path="*/ss_react" component={SysmonSearchTabs} />
<Route  path="*/ss_react/event" component={SysmonSummary} />
</Switch>
</Router>
);
  }
}
