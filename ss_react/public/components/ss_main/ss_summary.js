import React from 'react';
import {
  EuiLink,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel
} from '@elastic/eui';

const qs = require('query-string');
import {pieChart, segColor} from './pie_chart';

export class SysmonSummary extends React.Component {
  constructor(props){
    super(props);
    let params = qs.parse(this.props.location.search)
    this.state = {
      host: params.host,
      date: params.date,
      items:[],
      total:0
    };
    this.chartRef = React.createRef();
  }

  componentDidMount(){
    fetch('../../api/sysmon-search-plugin/events', {
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

  summaryLegend = (items, total) => {
    return items.map(function(item, i){
      let percentage = item.value / total;
      let style= {
        width: "16px",
        height: "16px",
        float: "left",
        marginRight: "10px",
        background: item.value > 0?segColor(i):""
      }
      return(
      <tr key={item.type}>
<td><div className="square" style={style}></div><a href="#">{item.type}</a></td>
<td align="right">{item.value}</td>
<td align="right">{percentage.toFixed(2)}%</td>
</tr>
      );
    });
  }

  render() {
console.log(this.state)
    return (
<div id="summary" style={{maxWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="m">
<h3>Event Summary</h3>
</EuiTitle>
      <EuiPanel>
      <EuiText size="m">
<h3>{this.state.host}@{this.state.date}</h3>
  <EuiFlexGroup>
    <EuiFlexItem grow={false}>
<div id="piechart" ref={cr => this.chartRef = cr}></div>
</EuiFlexItem>
    <EuiFlexItem grow={false}>
<table className="legend">
<thead>
<tr>
<th>Type</th>
<th style={{paddingLeft:"10px"}}>Count</th>
<th style={{paddingLeft:"10px"}}>Percentage</th></tr>
</thead>
<tbody>
{this.summaryLegend(this.state.items,this.state.total)}
<tr>
<td>Total</td>
<td align="right">{this.state.total}</td>
<td align="right"><a href="#">Correlation</a></td>
</tr>
</tbody>
</table>
</EuiFlexItem>
  </EuiFlexGroup>
      </EuiText>
      </EuiPanel>
</div>
    )
  }


};

