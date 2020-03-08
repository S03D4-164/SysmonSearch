import React, { Fragment } from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiInMemoryTable,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiIcon,
  EuiButtonIcon,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

import { SysmonStats } from './ss_stats';

export class SysmonEvents extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      keyword:"",
      sortField: 'date',
      sortDirection: 'asc',
    };
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;

    const { field: sortField, direction: sortDirection } = sort;

    this.setState({
      sortField,
      sortDirection,
    });
  };

  componentDidMount(){ this.getEvents() };
  
  clickSearch(){ this.getEvents() };

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
            let params = "?host=" + r.key + "&date=" + res.date;
            let item = {
              date: res.date,
              pc: r.key,
              count: r.doc_count,
              event: "sysmon_search_r/event" + params,
              stats: "sysmon_search_r/stats" + params,
              process: "sysmon_search_r/process" + params,
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
    {
      field: 'date',
      sortable: true,
      name: 'Date',
      render: (date, item) => (
        <Fragment>
        <EuiButtonIcon href={item.stats} 
        iconType="visBarVerticalStacked" />
        {date}</Fragment>
      )
    },
    {
      field: 'pc',
      name: 'Hostname',
      sortable: true,
      render: (pc, item) => (
        <Fragment>
        <EuiButtonIcon href={item.process} 
        iconType="graphApp" />
        {pc}</Fragment>
      )
    },
    {
      field: 'count',
      name: 'Count',
      sortable: true,
      render: (count, item) => (
        <Fragment>
        <EuiButtonIcon href={item.event}
        iconType="visPie"/>
        {count}</Fragment>
      )
    }
  ];


    const { sortField, sortDirection } = this.state;
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    };


  return (
      <EuiPanel>
  <EuiFlexGroup >
    <EuiFlexItem style={{ minWidth: 400 }}>
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
        <EuiButton onClick={ () => this.clickSearch() }
         iconType="search"
        >Search</EuiButton>
      </EuiFormRow>
    </EuiFlexItem>
  </EuiFlexGroup >
  <EuiSpacer />

    <EuiInMemoryTable
      items={this.state.items}
      columns={columns}
      sorting={sorting}
    />

      </EuiPanel>

  );
  }

};
