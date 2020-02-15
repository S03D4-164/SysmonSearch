import React from "react";
import Graph from "react-graph-vis";
import imgProgram from "./images/program.png"
import imgNet from "./images/net.png"

function splitByLength(str, length) {
  var resultArr = [];
  if (!str || !length || length < 1) return resultArr;
  var index = 0;
  var start = index;
  var end = start + length;
  while (start < str.length) {
    resultArr[index] = str.substring(start, end);
    index++;
    start = end;
    end = start + length;
  }
  return resultArr;
}

function add_child_info(cur, graph) {
  for (let index in cur.child) {
    var item = cur.child[index];
    var tmp_str_array = splitByLength(item.current.image, 10);
    var tmp_label = tmp_str_array.join('\n');
    var tmp_node = {
      "id": item.current.index,
      "label": tmp_label,
      "title": item.current.cmd,
      "shape": "circularImage",
      "image": imgProgram,
      "guid": item.current.guid,
      "info": item.current.info
    };

/*
    if (search(item.current.info, keyword, hash)
    || (firstflg == true && $route.current.params.guid == item.current.guid)) {
      tmp_node["color"] = {
        "background": "red",
        "border": "red"
      };
      tmp_node["borderWidth"] = 3;
    }
*/
    // console.log( tmp_node );
    graph["nodes"].push(tmp_node);

    var tmp_edge = {
      "from": cur.current.index,
      "to": item.current.index,
      "arrows": "to",
      "color": {"color": "lightgray"},
      "length": 200
    };
    // console.log( tmp_edge );
    graph["edges"].push(tmp_edge);

    for( let n_key in item.current.info.Net ) {
      var n_item = item.current.info.Net[ n_key ];
      var n_index = item.current.index+"-"+n_key;
      var tmp_node = {
        "id": n_index,
        "label": n_key+":"+n_item,
        "title": n_key+":"+n_item,
        "shape": "circularImage",
        "image": imgNet,
        "guid": item.current.guid,
        "info": item.current.info
      };
      if( n_item > 100) {}
      //nodes.push(tmp_node);
      graph["nodes"].push(tmp_node);
      var tmp_edge = {
        "from": item.current.index,
        "to": n_index,
        "arrows": "to",
        "color": {"color": "lightgray"},
        "length": 200
      };
      //edges.push(tmp_edge);
      graph["edges"].push(tmp_edge);
    }

    graph = add_child_info(item, graph);
  }

  return graph;
}


function local_search(data, keyword) {
  for (var key in data) {
    if (Array.isArray(data[key])) {
      if (local_search(data[key], keyword)) {
        return true;
      }
    } else if (data[key] instanceof Object) {
      if (local_search(data[key], keyword)) {
        return true;
      }
    } else {
      if (String(data[key]).indexOf(keyword) != -1) {
        return true;
      }
    }
  }
  return false;
}

function search(data, keyword, hash) {
  var flg1 = 1;
  var flg2 = 1;
  if (keyword != null && keyword !== "") {
    if (local_search(data, keyword)) {
      flg1 = 2;
    }
  } else {
    flg1 = 3;
  }

  if (hash != null && hash !== "") {
    if (data["Hashes"] != null) {
      if (data["Hashes"].indexOf(hash) != -1) {
        flg2 = 2;
      }
    }
  } else {
    flg2 = 3;
  }

  if ((flg1 == 2 && flg2 == 2) || (flg1 == 2 && flg2 == 3) || (flg1 == 3 && flg2 == 2)) {
    return true;
  } else {
    return false;
  }
}

function createNetwork(tops, keyword, hash, firstflg) {
  var graph = {nodes:[], edges:[]}
  for( let index in tops ) {
    var top = tops[index];
    var tmp_node = {
      "id": top.current.index,
      "label": top.current.image,
      "title": top.current.cmd,
      "shape": "circularImage",
      "image": imgProgram,
      "guid": top.current.guid,
      "info": top.current.info
    };
    /*
    if (search(top.current.info, keyword, hash)) {
      tmp_node["color"] = {
        "background": "red",
        "border": "red"
      };
      tmp_node["borderWidth"] = 3;
    }
    nodes.push(tmp_node);
    */
    graph["nodes"].push(tmp_node);
    graph = add_child_info(top, graph);
  }
  return graph;
}


export class GraphView extends React.Component {

  constructor(props) {
    super(props);

  this.state = {
    graph:{},
    options:{},
    events:null,
    network:null, 
    textarea:""
  }

    this.setNetwork = this.setNetwork.bind(this);
    this.setText = this.setText.bind(this);
  }

  setText(str){
      this.setState({
        textarea:str
      });
  }

  setNetwork(nw){
    const settxt = this.setText;
    const host = this.props.host;
    const date = this.props.date;
const events = {
  doubleClick: function(properties) {
    if (!properties.nodes.length) return;
    const network = nw;
    var node = network.body.data.nodes.get(properties.nodes[0]);
    console.log(node);
    if(node.guid != null && node.guid!="" && node.guid!="root"){
      var url = '../../process_overview/' + host + '/' + date.substr(0, 10) + '/' + node.guid;
      console.log(url);
      //window.open(url, "_blank");
    }
  },
  click: function(properties) {
  const network = nw;
  var nodeid = network.getNodeAt(properties.pointer.DOM);
  if (nodeid) {
    network.selectNodes([nodeid], true);
    var node = network.body.data.nodes.get(nodeid);
    //console.log(node)
    if (node && node.info) {
      const veiw_data_1 = [
        "CurrentDirectory", "CommandLine", "Hashes", "ParentProcessGuid", "ParentCommandLine", "ProcessGuid"
      ];
      var str = "";
      for (var key in node.info) {
        if (veiw_data_1.indexOf(key) >= 0) {
          if (str === "") {
            str = key + ":" + node.info[key];
          } else {
            str = str + "\n" + key + ":" + node.info[key];
          }
        }
      }
      settxt(str);
      //network.fit();
    }
  }
}
}

    this.setState({
      network:nw,
      events:events,
    })
  }

  render(){

  const graph = createNetwork(
    this.props.tops,
    null,
    null,
    true,
  );

  var options = {
    autoResize: true,
    //nodes: {size: 25},
    edges: {
      width: 2,
      shadow: false,
      smooth: {
        type: 'continuous',
        roundness: 0
      }
    },
    layout: {improvedLayout:true},
    interaction: {
      navigationButtons: true,
      keyboard: true
    },
    height: "500px"
  };


options = {
    layout: {improvedLayout:true},
    interaction: {
      navigationButtons: true,
      keyboard: true
    },

                edges: {
                    smooth: {
                        type: 'cubicBezier',
                        forceDirection: 'vertical',
                        roundness: 0.4
                    }
                },
                layout: {
                    hierarchical: {
                        direction: "UD"
                    }
                },

                physics:false,
    height: "500px",
    autoResize: true,
}

  console.log(this.state);
  return (
    <div>
    <div>
    <textarea rows="7" cols="120" readonly placeholder="click node." value={this.state.textarea}></textarea>
    </div><br/>
    <Graph
      graph={graph}
      options={options}
      events={this.state.events}
      getNetwork={this.setNetwork}
    />
    </div>
  )

  }
}

