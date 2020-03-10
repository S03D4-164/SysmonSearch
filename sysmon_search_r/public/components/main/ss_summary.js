import React, {Component} from 'react';
import chrome from 'ui/chrome';

import {
  EuiLink,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui';

const qs = require('query-string');
import {pieChart, segColor} from './pie_chart';

export class SysmonSummary extends Component {
  constructor(props){
    super(props);
    const params = qs.parse(this.props.location.search)
    this.state = {
      host: params.host,
      date: params.date,
      items:[],
      total:0
    };
    this.chartRef = React.createRef();
    this.top = chrome.addBasePath('/app/sysmon_search_r');
    this.stats = this.top + "/stats" + this.props.location.search;
    this.process = this.top + "/process" + this.props.location.search;
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
        period: this.state.date,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //var items = responseJson;
      console.log(JSON.stringify(responseJson));
      var item = responseJson["count"];
      var freqData = item;
      pieChart(this.chartRef, freqData, false, 400);
      var items = [];
      var total = 0;
      for (let [key, value] of Object.entries(item)) {
        items.push({
          "type":key,
          "value":value,
        });
        total+=value;
      }
      this.setState({
        items:items,
        total:total,
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  summaryLegend = (items, total, host, date) => {
    return items.map(function(item, i){
      if (item.value<=0) return;
      let percentage = item.value / total * 100;
      let style= {
        width: "16px",
        height: "16px",
        float: "left",
        marginRight: "10px",
        background: item.value > 0?segColor(i):""
      };
      let processlist = "process_list?";
      processlist += "host=" + host;
      processlist += "&date=" + date;
      processlist += "&category=" + item.type;
      return(
      <tr key={item.type}>
        <td>
          <div className="square" style={style}></div>
          <a href={processlist}>{item.type}</a>
        </td>
        <td align="right">{item.value}</td>
        <td align="right">{percentage.toFixed(2)}%</td>
      </tr>
      );
    });
  }

  render() {
    console.log(this.state);

    return (

      <div id="summary" style={{maxWidth:"1280px",margin:"0 auto"}}>

        <EuiTitle size="s">
          <h3>Event Summary: {this.state.host}@{this.state.date}</h3>
        </EuiTitle>

        <EuiPanel><EuiText size="m">

          <EuiFlexGroup>

            <EuiFlexItem grow={false}>
              <div id="piechart" ref={cr => this.chartRef = cr}></div>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <table className="legend">
                <thead><tr>
                  <th>Type</th>
                  <th style={{paddingLeft:"10px"}}>Count</th>
                  <th style={{paddingLeft:"10px"}}>Percentage</th>
                </tr></thead>
                <tbody>
                  {this.summaryLegend(
                    this.state.items,
                    this.state.total,
                    this.state.host,
                    this.state.date,
                  )}
                  <tr>
                    <td>Total</td>
                    <td align="right">{this.state.total}</td>
                  </tr>
                </tbody>
              </table>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiButton size="s" href={this.top} iconType="arrowLeft">Top</EuiButton>
          <EuiButton size="s" href={this.stats} iconType="visBarVerticalStacked">Stats</EuiButton>
          <EuiButton size="s" href={this.process} iconType="graphApp">Process</EuiButton>
      
        </EuiText></EuiPanel>
      </div>
    )
  }
};
