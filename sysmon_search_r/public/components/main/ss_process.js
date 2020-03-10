import React, {Component} from 'react';
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
  EuiSelect,
  EuiFieldText,
} from '@elastic/eui';

const qs = require('query-string');

import {GraphView} from './process_network';

export class SysmonProcess extends Component {
  constructor(props){
    super(props);
    const params = qs.parse(this.props.location.search);
    this.state = {
      host: params.host,
      date: params.date,
      tops:[],
      keyword:null,
      hash:null,
      firstflg:true,
      graph:{},
      events:null,
      network:null,
      textarea:"",
      layout: "UD",
    };

    this.layouts =[
      {value:"LR", text:"Left to Right"},
      {value:"UD", text:"Up to Down"},
      {value:"default", text:"Default"},
    ]

    this.top = chrome.addBasePath('/app/sysmon_search_r');
    this.stats = this.top + '/stats' + this.props.location.search;
    this.summary = this.top + '/event' + this.props.location.search;

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);

  }

  componentDidMount(){ this.getProcess() };

  clickSearch(){ this.getProcess() };

  getProcess(){
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

  handleChangeLayout = event => {
    this.setState({ layout: event.target.value });
  }

  render() {
    console.log(this.state)

    return (
      <div id="correlation" style={{minWidth:"1280px",margin:"0 auto"}}>

        <EuiTitle size="s">
          <h3>Event Correlation: {this.state.host}@{this.state.date}</h3>
        </EuiTitle>

        <EuiPanel>

          <EuiFlexGroup>

            <EuiFlexItem>
              <EuiFormRow display="columnCompressed" label="Layout">
                <EuiSelect 
                  name="layout"
                  compressed
                  value={this.state.layout}
                  options={this.layouts}
                  onChange={this.handleChangeLayout} />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow display="columnCompressed" label="Keyword">
                <EuiFieldText
                  name="keyword"
                  compressed
                  onChange={this.handleChange} />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow display="columnCompressed" label="Hash">
                <EuiFieldText
                  name="hash"
                  compressed
                  onChange={this.handleChangeHash} />
              </EuiFormRow>
            </EuiFlexItem>

          </EuiFlexGroup >

          <GraphView
            tops={this.state.tops}
            host={this.state.host}
            date={this.state.date}
            keyword={this.state.keyword}
            hash={this.state.hash}
            layout={this.state.layout}

          />

          <EuiButton size="s" href={this.top} iconType="arrowLeft">Top</EuiButton>
          <EuiButton size="s" href={this.stats} iconType="visBarVerticalStacked">Stats</EuiButton>
          <EuiButton size="s" href={this.summary} iconType="visPie">Summary</EuiButton>

        </EuiPanel>
      </div>
    )
  }

};

