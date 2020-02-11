import vis from 'vis/dist/vis-timeline-graph2d.min'
import 'vis/dist/vis-timeline-graph2d.min.css'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import each from 'lodash/each'
import assign from 'lodash/assign'
import omit from 'lodash/omit'
import keys from 'lodash/keys'
import moment from 'moment'

const noop = function() {}
const events = [
  'currentTimeTick',
  'click',
  'contextmenu',
  'doubleClick',
  'groupDragged',
  'changed',
  'rangechange',
  'rangechanged',
  'select',
  'timechange',
  'timechanged',
  'mouseOver',
  'mouseMove',
  'itemover',
  'itemout',
]

const eventPropTypes = {}
const eventDefaultProps = {}

each(events, event => {
  ;(eventPropTypes[event] = PropTypes.func),
    (eventDefaultProps[`${event}Handler`] = noop)
})

export default class Timeline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customTimes: [],
    }
    this.chartRef = React.createRef();
    console.log(props);
  }

  componentWillUnmount() {
    this.$el.destroy()
  }

  componentDidMount() {
    const container = this.chartRef;

    //this.$el = new vis.Timeline(container, undefined, this.props.options)
    var graph2d = new vis.Graph2d(container, undefined, this.props.options)
    this.$el = graph2d;

const get_category_name = function (date_str, event) {
  var y = event.value[0];
  var linegraph = graph2d.linegraph;
  var groups = linegraph.groups;

  var bar_items = [];
  var bar_height = 0;
  var ids = linegraph.itemsData.getIds();
  //console.log(ids);
  for (var i = 0; i < ids.length; i++) {
    var height = 0;
    var item = linegraph.itemsData._getItem(ids[i]);
    //console.log(item, date_str);
    if (item.x !== date_str) continue;

    bar_height = bar_height + item.y;
    bar_items.push({
      height: item.y,
      groupId: item.group
    });
  }
  //console.log(bar_items);

  var cur_top = bar_height;
  var groupId = -1;
  for (var i = 0; i < bar_items.length; i++) {
    var item = bar_items[i];
    //console.log(item);
    if (item.height == 0) continue;
    var cur_bottom = cur_top - item.height;
    if (cur_bottom <= bar_height - y && bar_height - y <= cur_top) {
      groupId = item.groupId;
      break;
    }
    cur_top = cur_bottom;
  }
  var category_name = '';
  if (groupId != -1) category_name = groups[groupId]["content"];
  return category_name;
}

    //events.forEach(event => {
    //  this.$el.on(event, this.props[`${event}Handler`])
    //})

    this.$el.on("rangechange", function() {
      graph2d.redraw();
    });

    this.$el.on("contextmenu", function(event) {
      var click_date = moment(event.time).format("YYYY-MM-DD");
      var category = get_category_name(click_date, event);
      alert(category);
    });

    let hostname = this.props.host;
    this.$el.on("doubleClick", function(event) {
      var click_date = moment(event.time).format("YYYY-MM-DD");
      var category = get_category_name(click_date, event);
      if (category == '') return;
      var url = 'process_list?host=' + hostname;
      url += '&category=' + category;
      url += '&date=' + click_date;
      console.log(url);
      //window.open(url, "_blank");
    });

    this.init()
  }

  componentDidUpdate() {
    this.init()
  }

  shouldComponentUpdate(nextProps) {
    const { items, groups, options, selection, customTimes } = this.props

    const itemsChange = items !== nextProps.items
    const groupsChange = groups !== nextProps.groups
    const optionsChange = options !== nextProps.options
    const customTimesChange = customTimes !== nextProps.customTimes
    const selectionChange = selection !== nextProps.selection

    return (
      itemsChange ||
      groupsChange ||
      optionsChange ||
      customTimesChange ||
      selectionChange
    )
  }

  init() {
    const {
      items,
      groups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
      animate = true,
      currentTime,
    } = this.props

    let timelineOptions = options

    if (animate) {
      // If animate option is set, we should animate the timeline to any new
      // start/end values instead of jumping straight to them
      timelineOptions = omit(options, 'start', 'end')

      this.$el.setWindow(options.start, options.end, {
        animation: animate,
      })
    }

    this.$el.setOptions(timelineOptions)

    if (groups.length > 0) {
      const groupsDataset = new vis.DataSet()
      groupsDataset.add(groups)
      this.$el.setGroups(groupsDataset)
    }

    this.$el.setItems(items)
    //this.$el.setSelection(selection, selectionOptions)

    if (currentTime) {
      this.$el.setCurrentTime(currentTime)
    }

    // diff the custom times to decipher new, removing, updating
    const customTimeKeysPrev = keys(this.state.customTimes)
    const customTimeKeysNew = keys(customTimes)
    const customTimeKeysToAdd = difference(
      customTimeKeysNew,
      customTimeKeysPrev
    )
    const customTimeKeysToRemove = difference(
      customTimeKeysPrev,
      customTimeKeysNew
    )
    const customTimeKeysToUpdate = intersection(
      customTimeKeysPrev,
      customTimeKeysNew
    )

    // NOTE this has to be in arrow function so context of `this` is based on
    // this.$el and not `each`
    each(customTimeKeysToRemove, id => this.$el.removeCustomTime(id))
    each(customTimeKeysToAdd, id => {
      const datetime = customTimes[id]
      this.$el.addCustomTime(datetime, id)
    })
    each(customTimeKeysToUpdate, id => {
      const datetime = customTimes[id]
      this.$el.setCustomTime(datetime, id)
    })

    // store new customTimes in state for future diff
    this.setState({ customTimes })
  }

  render() {
    return <div ref={container => this.chartRef = container} />
  }
}

Timeline.propTypes = assign(
  {
    host: PropTypes.string,
    items: PropTypes.array,
    groups: PropTypes.array,
    options: PropTypes.object,
    selection: PropTypes.array,
    customTimes: PropTypes.shape({
      datetime: PropTypes.instanceOf(Date),
      id: PropTypes.string,
    }),
    animate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    currentTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.number,
    ]),
  },
  eventPropTypes
)

Timeline.defaultProps = assign(
  {
    //host:"",
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {},
  },
  eventDefaultProps
)
