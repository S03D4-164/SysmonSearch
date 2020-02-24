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
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
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
    };

    this.columns = [
    {field: 'utc', name: 'UTC Time', width:"20%"},
    {field: 'event', name: 'Event ID', width:"10%"},
    {field: 'pc', name: 'Hostname', width:"20%"},
    {field: 'user', name: 'User', width:"10%"},
    {field: 'image', name: 'image', width:"40%"},
    ];

    this.options = [
    {value:0, text:"-"},
    {value:1, text:"IP Address"},
    {value:2, text:"Port"},
    {value:3, text:"Hostname"},
    {value:4, text:"Process"},
    ];

    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleAddFields = this.handleAddFields.bind(this);
    this.handleRemoveFields = this.handleRemoveFields.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  clickSearch(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/sm_search');
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
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

    <EuiBasicTable		
        items={this.state.items}
        columns={this.columns}
    />

</EuiPanel>

);
  
}

};
