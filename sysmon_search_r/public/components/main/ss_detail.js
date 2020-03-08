import React from 'react';
import chrome from 'ui/chrome';

const qs = require('query-string');
import { local_search } from './ss_utils';
import {
  EuiInMemoryTable,
  EuiLink,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlexRow,
  EuiFormRow,
  EuiFieldText,
} from '@elastic/eui';

export class SysmonDetail extends React.Component {
  constructor(props){
    super(props);
    const params = qs.parse(this.props.location.search);
    this.state = {
      host: params.host,
      date: params.date,
      guid: params.guid,
      category: params.category,
      items:[],
      sortField: 'date',
      sortDirection: 'asc',
      pageIndex: 0,
      pageSize: 100,
      showPerPageOptions: true,
      total:0,
      keyword:null,
      hash:null,
      filteredItems:[],
    };

    this.columns = [
    {
      field: 'number',
      name: 'Number',
      sortable: true,
      width:"10%",
    },
    {
      field: 'date',
      name: 'Date',
      sortable: true,
      width:"20%",
    },
    {
      field: 'type',
      name: 'Type',
      width:"10%",
      sortable: true,
    },
    { field: 'process',
      name: 'Process',
      width:"30%",
      sortable: true,
    },
    {
      field: 'disp',
      name: 'Related',
      width:"30%",
      sortable: true,
      render: (disp, item) => (
        <EuiLink href={item.link} >{disp}</EuiLink>
      )
    },
  ];

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);
    this.filterList = this.filterList.bind(this);
    this.getItems = this.getItems.bind(this);

  }

  handleChange (event) {
    const keyword = event.target.value;
    const items = this.filterList(this.state.items, keyword, this.state.hash);
    this.setState({
      filteredItems: items,
      keyword: keyword,
    });
  }

  handleChangeHash (event) {
    const hash = event.target.value;
    const items = this.filterList(this.state.items, this.state.keyword, hash);
    this.setState({
      filteredItems: items,
      hash: hash,
    });
  }

  filterList(localdata, keyword, hash) {
    var search_data = [];
    var tmp_data = [];
    //var localdata = this.state.items
    if (keyword != null && keyword !== "") {
      for (var index in localdata) {
        if (local_search(localdata[index], keyword)) {
          tmp_data.push(localdata[index]);
        }
      }
    } else {
      tmp_data = localdata;
    }
    if (hash != null && hash !== "") {
      for (var index in tmp_data) {
        if (tmp_data[index]["info"] != null && tmp_data[index]["info"]["Hashes"] != null) {
          if (tmp_data[index]["info"]["Hashes"].indexOf(hash) != -1) {
            search_data.push(tmp_data[index]);
          }
        }
      }
    } else {
      search_data = tmp_data;
    }
    return search_data;
  };

  componentDidMount(){
    this.getItems();
  }

  clickSearch(){
    this.getItems();
  }

  getItems(){
    let api = chrome.addBasePath('/api/sysmon-search-plugin/process_detail');
    api += '/' + this.state.host;
    api += '/' + this.state.date;
    api += '/' + this.state.guid;
    const items = fetch(api, {
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
        this.setState({items:items, total:items.length});
    })
    .catch((error) =>{
      console.error(error);
    });
    return items;
  }

  render(){
    const sorting = {
      sort: {
        field: this.state.sortField,
        direction: this.state.sortDirection,
      },
    };

    const { pageIndex, pageSize } = this.state;
    const start = pageIndex * pageSize;
    const pageOfItems = this.state.items.slice(start, pageSize);
    const totalItemCount = this.state.total;
    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };

    console.log(this.state)
    var items = this.state.items;
    if (this.state.filteredItems.length>0) items = this.state.filteredItems;
    const total = items.length;

    return (

<div id="processlist" style={{maxWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="s">
<h3>{this.state.guid} on {this.state.host}@{this.state.date}</h3>
</EuiTitle>
      <EuiPanel>

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
  </EuiFlexGroup >
<EuiText><h3>Total: {total}</h3></EuiText>

   <EuiInMemoryTable
      items={items}
      columns={this.columns}
      sorting={sorting}
      pagination={pagination}
    />
</EuiPanel>
</div>
  );
  }
};
