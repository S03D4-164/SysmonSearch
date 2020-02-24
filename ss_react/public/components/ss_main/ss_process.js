import React from 'react';
import moment from 'moment';
import chrome from 'ui/chrome'

import Graph from "react-graph-vis";
import imgProgram from "./images/program.png"
import imgNet from "./images/net.png"

import {
  EuiTitle,
  EuiPanel,
  EuiButton,
} from '@elastic/eui';

const qs = require('query-string');
//import './ss_stats.css'
import {
  //createNetwork
  //addChildInfo
  GraphView
} from './process_network';


export class SysmonProcess extends React.Component {
  constructor(props){
    super(props);
    let params = qs.parse(this.props.location.search);
    this.state = {
      host: params.host,
      date: params.date,
      tops:[],
      keyword:null,
      hash:null,
      firstflg:true,
      //option:option,
      graph:{},
      events:null,
      network:null,
      textarea:"",
    };

    this.back = chrome.addBasePath('/app/ss_react');
    this.stats = chrome.addBasePath('/app/ss_react/stats')+ this.props.location.search;
    this.summary = chrome.addBasePath('/app/ss_react/event')+ this.props.location.search;

  }

  componentDidMount(){
    var api = "../../api/sysmon-search-plugin/process";
    api += "/" + this.state.host
    api += "/" + this.state.date;
    fetch(api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({tops:responseJson});
      console.log(JSON.stringify(responseJson));

      //const tops = responseJson;
    }) 
    .catch((error) =>{
      console.error(error);
    });
  }

  render() {
    //console.log(this.state)

/*
    const graph = createNetwork(
      this.state.tops,
      this.state.keyword,
      this.state.hash,
      this.state.firstflg,
    );
*/

    return (
<div id="correlation" style={{minWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="s">
<h3>Event Correlation: {this.state.host}@{this.state.date}</h3>
</EuiTitle>
<EuiPanel>
<EuiButton size="s" iconType="arrowLeft" href={this.back}>Top</EuiButton>
<EuiButton size="s" href={this.stats}>Stats</EuiButton>
<EuiButton size="s" href={this.summary}>Summary</EuiButton>
<GraphView tops={this.state.tops} host={this.state.host} date={this.state.date} />


</EuiPanel>
</div>
    )
  }
};

