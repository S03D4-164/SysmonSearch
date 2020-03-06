import React from 'react';
import chrome from 'ui/chrome'

import {
  EuiTitle,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
} from '@elastic/eui';

const qs = require('query-string');
import {GraphOverView} from './overview_network';

export class SysmonOverView extends React.Component {
  constructor(props){
    super(props);
    let params = qs.parse(this.props.location.search);
    //var api = "../../api/sysmon-search-plugin/process_overview";
    this.api = chrome.addBasePath("/api/sysmon-search-plugin/process_overview");
    this.api += "/" + params.host;
    this.api += "/" + params.date;
    this.api += "/" + params.guid;
    this.state = {
      host: params.host,
      date: params.date,
      guid: params.guid,
      tops:[],
      keyword:null,
      hash:null,
      firstflg:true,
      //option:option,
      graph:{},
      events:null,
      network:null,
      textarea:"",
      //api:api,
      layout:null,
    };

    this.layouts =[
      {value:"UD", text:"Up to Down"},
      {value:"LR", text:"Left to Right"},
      {value:"default", text:"Default"},
    ]

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);

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

  componentDidMount(){
    this.getProcess();
  }

  clickSearch(){
    this.getProcess();
  }

  getProcess(){
/*
  componentDidMount(){
    var api = "../../api/sysmon-search-plugin/process_overview";
    api += "/" + this.state.host;
    api += "/" + this.state.date;
    api += "/" + this.state.guid;
*/
    //fetch(this.state.api, {
    fetch(this.api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson)this.setState({tops:responseJson});
      console.log(JSON.stringify(responseJson));
    }) 
    .catch((error) =>{
      console.error(error);
    });
  }

  render() {
    //console.log(this.state)

    return (

<div id="correlation" style={{minWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="m">
  <h3>Overview</h3>
</EuiTitle>
      <EuiPanel>
<h3>{this.state.guid} on {this.state.host}@{this.state.date}</h3>

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

<GraphOverView
 tops={this.state.tops}
 host={this.state.host}
 date={this.state.date}
 keyword={this.state.keyword}
 hash={this.state.layout}
 direction={this.state.direction}
/>


  <EuiFlexItem grow={false}>
  <EuiFormRow
   display="columnCompressed"
   label="Layout" >
    <EuiSelect 
      name="layout"
      value={this.state.layout}
      options={this.layouts}
      onChange={this.handleChangeLayout}
    />
  </EuiFormRow>
  </EuiFlexItem>

      </EuiPanel>
</div>
    )
  }
};
