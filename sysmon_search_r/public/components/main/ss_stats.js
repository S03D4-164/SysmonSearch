import React from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiTitle,
  EuiPanel,
  EuiLink,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui';

const qs = require('query-string');
import Timeline from './react-visjs-timeline'
import './ss_stats.css'

export class SysmonStats extends React.Component {
  constructor(props){
    super(props);
    let params = qs.parse(this.props.location.search);
    this.state = {
      host: params.host,
      date: params.date,
      items:[],
      options:{},
      groups:[],
      category:[]
    };
    this.back = chrome.addBasePath('/app/sysmon_search_r');
    this.summary = chrome.addBasePath('/app/sysmon_search_r/event') + this.props.location.search;
    this.process = chrome.addBasePath('/app/sysmon_search_r/process') + this.props.location.search;
  }

  componentDidMount(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/events');
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        hostname: this.state.host,
        period: {
          "gte": moment(this.state.date).add(-1, 'M'),
          "lte": moment(this.state.date).add(1, 'M'),
        }
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(JSON.stringify(responseJson));
      var items = responseJson["items"];
      var category = responseJson["groups"];
      var groups = [];
      for (let index in category){
        groups.push({
          id: index,
          content: category[index],
          className: "visgroup" + index
        })
      }
      var options = {
        style: 'bar',
        stack: true,
        barChart: {
          width: 40,
          align: 'center',
        }, // align: left, center, right
        drawPoints: false,
        dataAxis: {icons: false},
        legend: {enabled:true},
        start: moment(this.state.date).add(-1, 'M'),
        end: moment(this.state.date).add(1, 'M'),
        orientation: 'top',
        sort:true,
        zoomable: true
      };

      this.setState({
        items:items,
        options:options,
        groups:groups,
        category:category,
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }
	

  render() {
    //console.log(this.state)
    return (
<div id="statistics" style={{minWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="s">
<h3>Host Statistics: {this.state.host}</h3>
</EuiTitle>

<EuiPanel>

<Timeline
  items={this.state.items}
  groups={this.state.groups}
  options={this.state.options}
  host={this.state.host}
/>

<EuiButton size="s" iconType="arrowLeft" href={this.back}>Top</EuiButton>
<EuiButton size="s" href={this.summary}>Summary</EuiButton>
<EuiButton size="s" href={this.process}>Process</EuiButton>

</EuiPanel>
</div>
    )
  }

};

