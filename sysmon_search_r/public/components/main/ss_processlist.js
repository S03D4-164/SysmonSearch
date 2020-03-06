import React from 'react';
import chrome from 'ui/chrome';

const qs = require('query-string');

import {
  EuiInMemoryTable,
  EuiLink,
  EuiTitle,
  EuiPanel,
} from '@elastic/eui';

export class SysmonProcessList extends React.Component {
  constructor(props){
    super(props);
    let params = qs.parse(this.props.location.search);
    this.state = {
      host: params.host,
      date: params.date,
      category: params.category,
      items:[],
      sortField: 'date',
      sortDirection: 'asc',
    };

    this.columns = [
    {
      field: 'number',
      name: 'number',
      sortable: true,
      width:"10%",
    },
    {
      field: 'date',
      name: 'date',
      sortable: true,
      width:"20%",
    },
    {
      field: 'type',
      name: 'type',
      width:"10%",
      sortable: true,
    },
    { field: 'process',
      name: 'process',
      width:"30%",
      sortable: true,
    },
    {
      field: 'disp',
      name: 'disp',
      width:"30%",
      sortable: true,
      render: (disp, item) => (
        <EuiLink href={item.link} >{disp}</EuiLink>
      )
    },
  ];

    this.onTableChange = this.onTableChange.bind(this);

  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({
      sortField,
      sortDirection,
    });
  };

  componentDidMount(){
    //let api = '../../api/sysmon-search-plugin/process_list';
    let api = chrome.addBasePath('/api/sysmon-search-plugin/process_list');
    api += '/' + this.state.host;
    api += '/' + this.state.category;
    api += '/' + this.state.date;
    //console.log(api);
    fetch(api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
        var items = [];
        responseJson.map(res => {
          let link = "process_overview";
          link += "?host=" + this.state.host;
          link += "&date=" + this.state.date;
          let guid = res.guid?res.guid:res.info.SourceProcessGuid;
          link += "&guid=" + guid;
          let item = {
            number: res.number,
            date: res.date,
            type: res.type,
            process: res.process,
            disp: res.disp,
            info: res.info,
            link: link,
          };
          items.push(item);
        });
        this.setState({items:items});
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  render(){

    const sorting = {
      sort: {
        field: this.state.sortField,
        direction: this.state.sortDirection,
      },
    };

  return (

<div id="processlist" style={{maxWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="m">
  <h3>Event List</h3>
</EuiTitle>
      <EuiPanel>
<h3>{this.state.category} in {this.state.host}@{this.state.date}</h3>
   <EuiInMemoryTable
      items={this.state.items}
      columns={this.columns}
      sorting={sorting}
      //onChange={this.onTableChange}
    />
</EuiPanel>
</div>
  );
  }
};
