import React from 'react';

import {
  EuiTitle,
  EuiPanel
} from '@elastic/eui';

const qs = require('query-string');
//import './ss_stats.css'
import {
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

    return (
<div id="correlation" style={{minWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="m">
  <h3>Event Correlation</h3>
</EuiTitle>
      <EuiPanel>
<GraphView tops={this.state.tops} host={this.state.host} date={this.state.date} />
      </EuiPanel>
</div>
    )
  }
};

