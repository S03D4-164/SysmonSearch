import React from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';


import {
  EuiBasicTable,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';

export class SysmonEvents extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      keyword:""
    };
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){
    this.getEvents();
  }
  
  clickSearch(){
    this.getEvents();
  }

  getEvents(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/hosts');
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        fm_start_date: this.state.startDate,
        fm_end_date: this.state.endDate,
        keyword: this.state.keyword,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
        var items = [];
        responseJson.map(res => {
          res.result.map(r  => {
            let item = {
              date: res.date,
              pc: r.key,
              count: r.doc_count,
              event: "ss_react/event?host=" + r.key + "&date=" + res.date,
              stats: "ss_react/stats?host=" + r.key + "&date=" + res.date,
              //events: "ss_react/event?host=" + r.key + "&date=" + res.date,
            };
            items.push(item);
          });
        });
        this.setState({
          items:items
        });
        //console.log(JSON.stringify(items));
    })
    .catch((error) =>{
      console.error(error);
    });
  }


  handleChangeStart(date) {
    this.setState({
      startDate: date,
    });
  }

  handleChangeEnd(date) {
    this.setState({
      endDate: date,
    });
  }

  handleChange (event) {
    //console.log(event.target)
    this.setState({
      keyword: event.target.value
    });
  }

  render(){
  const columns = [
    {field: 'date', name: 'Date'},
    {
      field: 'pc',
      name: 'Hostname',
      render: (count, item) => (
        <EuiLink href={item.stats} >
          {count}
        </EuiLink>
      )
    },
    {
      field: 'count',
      name: 'Count',
      render: (count, item) => (
        <EuiLink href={item.event} >
          {count}
        </EuiLink>
      )
    }
  ];

  return (
    <div>
      <EuiPanel>
  <EuiFlexGroup >
    <EuiFlexItem>
      <EuiFormRow label="Date">

      <EuiDatePickerRange
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
    <EuiFlexItem>

      <EuiFormRow label="Hostname">
      <EuiFieldText
      name="keyword"
      onChange={this.handleChange} />
      </EuiFormRow>
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiFormRow hasEmptyLabelSpace display="center">
<EuiButton onClick={ () => this.clickSearch() }>Search</EuiButton>
      </EuiFormRow>
    </EuiFlexItem>
  </EuiFlexGroup >

<EuiSpacer />

    <EuiBasicTable
      items={this.state.items}
      columns={columns}
    />

      </EuiPanel>
    </div>

  );
  }

};
