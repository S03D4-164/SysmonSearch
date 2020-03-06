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
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
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

    this.back = chrome.addBasePath('/app/sysmon_search_r');
    this.stats = chrome.addBasePath('/app/sysmon_search_r/stats')+ this.props.location.search;
    this.summary = chrome.addBasePath('/app/sysmon_search_r/event')+ this.props.location.search;
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);

  }

  componentDidMount(){
    this.getProcess();
  }

  clickSearch(){
    this.getProcess();
  }

  getProcess(){
    //var api = "../../api/sysmon-search-plugin/process";
    var api = chrome.addBasePath("/api/sysmon-search-plugin/process");
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

  handleChange (event) {
    this.setState({
      keyword: event.target.value
    });
  }

  handleChangeHash (event) {
    this.setState({
      hash: event.target.value
    });
  }

  render() {
    console.log(this.state)

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

  <EuiFlexGroup >
    <EuiFlexItem>
      <EuiFormRow label="Keyword">
      <EuiFieldText
      name="keyword"
      onChange={this.handleChange} />
      </EuiFormRow>
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiFormRow label="Hash">
      <EuiFieldText
      name="hash"
      onChange={this.handleChangeHash} />
      </EuiFormRow>
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiFormRow hasEmptyLabelSpace display="center">
<EuiButton onClick={ () => this.clickSearch() }>Search</EuiButton>
      </EuiFormRow>
    </EuiFlexItem>
  </EuiFlexGroup >

<GraphView
 tops={this.state.tops}
 host={this.state.host}
 date={this.state.date}
 keyword={this.state.keyword}
 hash={this.state.hash}
/>

</EuiPanel>
</div>
    )
  }
};

