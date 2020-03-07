import React from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiBasicTable,
  EuiInMemoryTable,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiLink,
} from '@elastic/eui';

export class SysmonSearch extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      total:{},
      inputFields: [{item:"", value:""}],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      conjunction:2,
      pageIndex: 0,
      pageSize: 100,
      showPerPageOptions: true,
    };

    this.columns = [
    {field: 'utc', name: 'UTC Time', width:"20%", sortable:true,
      render: (utc, item) => {
        let link = chrome.addBasePath('/app/sysmon_search_r/stats');
        link += "?host=" + item.pc + "&date=" + moment(item.utc).format("YYYY-MM-DD")
        return (<EuiLink href={link} >{utc}</EuiLink>)
      }
    },
    {field: 'event', name: 'Event ID', width:"10%", sortable:true},
    {field: 'pc', name: 'Hostname', width:"20%", sortable:true,
      render: (pc, item) => {
        let link = chrome.addBasePath('/app/sysmon_search_r/event');
        link += "?host=" + item.pc + "&date=" + moment(item.utc).format("YYYY-MM-DD")
        return (<EuiLink href={link} >{pc}</EuiLink>)
      }
    },
    {field: 'user', name: 'User', width:"10%", sortable:true},
    {field: 'description', name: 'Description', width:"10%", sortable:true,
      render: (descr, item) => {
        let link = chrome.addBasePath('/app/sysmon_search_r/process_list');
        link += "?host=" + item.pc + "&date=" + moment(item.utc).format("YYYY-MM-DD") + "&category=" + descr;
        return (<EuiLink href={link} >{descr}</EuiLink>)
      }
    },
    {field: 'image', name: 'image', width:"30%", sortable:true,
      render: (image, item) => {
        let link = chrome.addBasePath('/app/sysmon_search_r/process_overview');
        link += "?host=" + item.pc + "&date=" + moment(item.utc).format("YYYY-MM-DD") + "&guid=" + item.guid;
        return (<EuiLink href={link} >{image}</EuiLink>)
      }
    },
    ];

    this.options = [
    {value:0, text:"-"},
    {value:1, text:"IP Address"},
    {value:2, text:"Port"},
    {value:3, text:"Hostname"},
    {value:4, text:"Process Name"},
    {value:5, text:"Registry Key"},
    {value:6, text:"Registry Value"},
    {value:7, text:"Hash"},
    ];

    this.conjunctions = [
      {value:1, text:"AND"}, {value:2, text:"OR"}
    ]
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChangeConjunction = this.handleChangeConjunction.bind(this);
    this.handleAddFields = this.handleAddFields.bind(this);
    this.handleRemoveFields = this.handleRemoveFields.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  clickSearch(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/sm_search');
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
      search_conjunction: Number(this.state.conjunction),
    };
    const inputs = this.state.inputFields;
    for (let index in inputs) {
      if (inputs[index].item && inputs[index].value){
      let id = index + 1;
      let searchItem = "search_item_" + Number(id).toString();
      data[searchItem] = inputs[index].item;
      let searchValue = "search_value_" + Number(id).toString();
      data[searchValue] = inputs[index].value;
      }
    }
    console.log(data);
    fetch(api, {method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(data)
    }).then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
        var items = [];
        responseJson.hits.map(res => {
            let item = {
              utc: res.utc_time,
              event: res.event_id,
              pc: res.computer_name,
              user: res.user_name,
              image: res.image,
              description: res.description,
              guid: res.process_guid,
            };
            items.push(item);
        });
        this.setState({
          items:items,
          total:responseJson.total,
        });
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  handleChangeStart(date) {
    this.setState({ startDate:date });
  }

  handleChangeEnd(date) {
    this.setState({ endDate: date });
  }

  handleChangeConjunction = event => {
    this.setState({ conjunction: event.target.value });
  }

  handleAddFields = () => {
    const values = [...this.state.inputFields];
    values.push({ item: '', value: '' });
    this.setState({inputFields:values});
  };

  handleRemoveFields = index => {
    const values = [...this.state.inputFields];
    values.splice(index, 1);
    this.setState({inputFields:values});
  };

  handleInputChange = (index, event) => {
    const values = [...this.state.inputFields];
    if (event.target.name === "item") {
      values[index].item = event.target.value;
    } else {
      values[index].value = event.target.value;
    }
    this.setState({inputFields:values});
  };

render(){
    const { pageIndex, pageSize } = this.state;
    const pageOfItems = this.state.items.slice(start, pageSize);
    const totalItemCount = this.state.total;

    const sorting = {
      sort: {
        field: "utc",
        direction: "asc",
      }
    };

    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };

return (

<EuiPanel>

  <EuiFlexItem>
  <EuiFormRow 
   display="columnCompressed"
   label="Date" >
      <EuiDatePickerRange style={{minWidth:500}}
        startDateControl={
          <EuiDatePicker
            selected={this.state.startDate}
            onChange={this.handleChangeStart}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            isInvalid={this.state.startDate > this.state.endDate}
            aria-label="Start date"
            showTimeSelect
          />
        }
        endDateControl={
          <EuiDatePicker
            selected={this.state.endDate}
            onChange={this.handleChangeEnd}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            isInvalid={this.state.startDate > this.state.endDate}
            aria-label="End date"
            showTimeSelect
          />
        }
      />
  </EuiFormRow>
  </EuiFlexItem>

<EuiSpacer size="m" />

{this.state.inputFields.map((inputField, index) => (

<EuiFlexGroup key={`input-${index}`}>

  <EuiFlexItem grow={false}>
  <EuiFormRow
   display="columnCompressed"
   label="Field" >
    <EuiSelect 
      name="item"
      value={inputField.item}
      options={this.options}
      onChange={event => this.handleInputChange(index, event)}
    />
  </EuiFormRow>
  </EuiFlexItem>

  <EuiFlexItem style={{maxWidth:400}}>
    <EuiFieldText 
      name="value"
      value={inputField.value}
      onChange={event => this.handleInputChange(index, event)}
    />
  </EuiFlexItem>

  <EuiFlexItem grow={false}>
      <EuiButton size="m" iconType="arrowLeft"
        onClick={() => this.handleRemoveFields(index)}
      >DEL</EuiButton>
  </EuiFlexItem>

</EuiFlexGroup >

))}
  
<EuiSpacer size="m" />

<EuiFlexGroup >

  <EuiFlexItem grow={false}>
  <EuiFormRow
   display="columnCompressed"
   label="Conjunction" >
    <EuiSelect 
      name="conjunction"
      value={this.state.conjunction}
      options={this.conjunctions}
      onChange={this.handleChangeConjunction}
    />
  </EuiFormRow>
  </EuiFlexItem>

  <EuiFlexItem grow={false}>
      <EuiButton size="m" iconType="arrowUp"
        onClick={() => this.handleAddFields()}
      >ADD</EuiButton>
  </EuiFlexItem>
  <EuiFlexItem grow={false}>
      <EuiButton size="m" onClick={ () => this.clickSearch() }>Search</EuiButton>
  </EuiFlexItem>
  <EuiFlexItem >
    <EuiText><h2>Total: {this.state.total.value}</h2></EuiText>
  </EuiFlexItem >

</EuiFlexGroup >

<EuiSpacer size="m"/>

    <EuiInMemoryTable		
      items={this.state.items}
      columns={this.columns}
      pagination={pagination}
      sorting={sorting}
    />

</EuiPanel>

);
  
}

};
