import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'

import { SysmonSearchTabs } from './ss_tabs';
import { SysmonSummary } from './ss_summary';
import { SysmonStats } from './ss_stats';
import { SysmonProcess } from './ss_process';
/*
import { SysmonProcessList } from './ss_processlist';
*/
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
          <Route path="*/ss_react/event" component={SysmonSummary} />
          <Route path="*/ss_react/stats" component={SysmonStats} />
          <Route path="*/ss_react/process" component={SysmonProcess} />
/*
          <Route path="/ss_react/process_list" component={SysmonSummary} />
*/
        </Switch>
      </Router>
    );
  }

}
