//Sequence Preserving Comparison
function seqPreservingComparison(client, length, nodes, start, incomingXorNodes, endName, tpIndex) {
  var prev = start;
  var prevId = start;
  const endConnection = {};
  var k = null;
  var s = null;
  var l;
  for (let i = 0; i < length; i++) {
    let str = client[i].method + client[i].location;
    let key = client[i].method + ' ' + client[i].location;
    let status = client[i].status;
    if (nodes[str] === undefined) {
      nodes[str] = {}
    }
    let node = {
      "id": i,
      "startId": prevId,
      "endId": i,
      "dataNode": client[i],
      "start": prev,
      "end": str + ' ' + status,
      "key": key,
      "finalEnd": start,
      "finalStart": prev,
      "conv": tpIndex,
    };
    let delay = computeDelay(nodes, node.start, node.dataNode);
    if (k == null || s == null) {
      k = str;
      s = status;
    } else {
      l = nodes[k][s].statusArray.length;
      nodes[k][s].statusArray[l - 1].finalEnd = str + ' ' + status;
      k = str;
      s = status;
    }
    if (nodes[str][status] === undefined) {
      nodes[str][status] = {
        statusArray: [],
        outgoingXOR: false,
        delayArray: [],
        tpIpArray: [],
      }
    }
    if (nodes[str][status].tpIpArray.includes(tpIndex) != true) {
      nodes[str][status].tpIpArray.push(tpIndex);
    }
    nodes[str][status].delayArray.push(delay);
    nodes[str][status].statusArray.push(node);
    let arrIndex = nodes[str][status].statusArray.length - 1;
    nodes[str][status].statusArray[arrIndex].arrIndex = arrIndex;
    prev = str + ' ' + status;
    prevId = i;
    if (i == (length - 1)) {
      endConnection.e1 = prev;
      l = nodes[str][status].statusArray.length;
      nodes[k][s].statusArray[l - 1].finalEnd = endName;
    }
  }
  nodes = outgoingXOR(nodes);
  nodes = incomingXOR(nodes, start, incomingXorNodes);
  nodes.endConnection = endConnection;
  return nodes;
}

function outgoingXOR(nodes) {
  var counterArray = [];
  var xorTitle;
  for (var key in nodes) {
    for (var status in nodes[key]) {
      if (nodes[key][status].statusArray.length > 1) {
        let check = false;
        for (let i = 0; i < nodes[key][status].statusArray.length; i++) {
          for (let j = i + 1; j < nodes[key][status].statusArray.length; j++) {
            if (nodes[key][status].statusArray[i].finalEnd.split(' ')[0] != nodes[key][status].statusArray[j].finalEnd.split(' ')[0]) {
              check = true;
            }
          }
        }
        if (check) {
          xorTitle = key + ' ' + status;
          nodes[key][status].outgoingXOR = true;
          counterArray.push(xorTitle);
        }
      }
    }
  }
  for (var key in nodes) {
    for (var status in nodes[key]) {
      for (let i = 0; i < nodes[key][status].statusArray.length; i++) {
        for (let j = 0; j < counterArray.length; j++) {
          if (counterArray[j] == nodes[key][status].statusArray[i].start) {
            nodes[key][status].statusArray[i].start = "XOR-" + counterArray[j];
          }
        }
      }
    }
  }
  return nodes;
}

function incomingXOR(nodes, start, incomingXorNodes) {
  var incomingXorKeys = [];
  var keyCounter = 0;
  var keyArray = [];
  for (var key in nodes) {
    keyArray.push(key);
  }
  for (let i = 0; i < keyArray.length; i++) {
    for (var key in nodes) {
      for (var status in nodes[key]) {
        for (let j = 0; j < nodes[key][status].statusArray.length; j++) {
          let spaces = nodes[key][status].statusArray[j].end.split(' ');
          if ((spaces[0] == start && i == 0) || spaces[0] == "XOR-" + keyArray[i] || spaces[0] == keyArray[i]) {
            keyCounter++;
          }
        }
      }
    }
    if (keyCounter > 1) {
      incomingXorKeys.push({"key": keyArray[i], "id": i})
    }
    keyCounter = 0;
  }
  for (let i = 0; i < incomingXorKeys.length; i++) {
    for (var key in nodes) {
      if (key == incomingXorKeys[i].key) {
        for (var status in nodes[key]) {
          for (let j = 0; j < nodes[key][status].statusArray.length; j++) {
            if (nodes[key][status].statusArray[j].start !== "inXOR-" + key) {
              var spaces = nodes[key][status].statusArray[j].start
              nodes[key][status].statusArray[j].start = "inXOR-" + key
              if (incomingXorNodes[key] === undefined) {
                incomingXorNodes[key] = {};
              }
              if (incomingXorNodes[key][spaces] === undefined) {
                incomingXorNodes[key][spaces] = [];
              }
              incomingXorNodes[key][spaces].push(spaces.split(' '));
            } else {
              let spaces = nodes[key][status].statusArray[j].finalStart.split(' ');
              if (spaces.length > 1 && nodes[spaces[0]][spaces[1]].outgoingXOR && incomingXorNodes[key][spaces[0] + ' ' + spaces[1]] !== undefined) {
                let newKey = "XOR-" + spaces[0] + ' ' + spaces[1];
                if (incomingXorNodes[key][newKey] === undefined) {
                  incomingXorNodes[key][newKey] = []
                }
                for (let k = 0; k < incomingXorNodes[key][spaces[0] + ' ' + spaces[1]].length; k++) {
                  var formKey = "XOR-" + spaces[0] + ' ' + spaces[1];
                  incomingXorNodes[key][newKey].push(formKey.split(' '));
                }
                delete incomingXorNodes[key][spaces[0] + ' ' + spaces[1]];
              }
            }
          }
        }
      }
    }
  }
  var obj = {
    "nodes": nodes,
    incomingXorNodes: incomingXorNodes,
  };
  return obj;
}

function computeDelay(nodes, startNode, endNode) {
  if (startNode.includes("start")) return 0;
  startNode = startNode.split(' ');
  let length = nodes[startNode[0]][startNode[1]].statusArray.length;
  let startDate = new Date(nodes[startNode[0]][startNode[1]].statusArray[length - 1].dataNode.datetime);
  let endDate = new Date(endNode.datetime);
  return (endDate - startDate);
}

function checkIfIncomingXorExists(nodes, key, incomingXorNodes, size, inXorId) {
  if (size == 1) {
    var id = Object.keys(incomingXorNodes[key])[0].split(' ');
    for (var status in nodes[key]) {
      for (let i = 0; i < nodes[key][status].statusArray.length; i++) {
        if (nodes[key][status].statusArray[i].start == inXorId) {
          nodes[key][status].statusArray[i].start = id[0] + ' ' + id[1];
        }
      }
    }
  }
}

function multipleIncomingXorSetUp(g, nodes, key, inXorIdSize, maxDelay, minDelay, incomingXorNodes) {
  var str = "inXOR-" + key;
  if (inXorIdSize > 1) {
    for (var space in incomingXorNodes[key]) {
      var len = incomingXorNodes[key][space][0].length;
      if (len == 1) {
        g.setEdge(incomingXorNodes[key][space][0][0], str,
          {class: "edge-thickness-" + incomingXorNodes[key][space].length + " delay-coloring-0"})
      } else {
        let avg = getIncomingEdgeIndexDelay(nodes, key, incomingXorNodes[key][space][0][0] + ' ' + incomingXorNodes[key][space][0][1], incomingXorNodes[key][space].length);
        bin = computeAssignBin(avg, maxDelay, 1);
        let p = getProbabilityLabel(nodes, incomingXorNodes[key][space][0][0], incomingXorNodes[key][space][0][1], incomingXorNodes[key][space].length);
        g.setEdge(incomingXorNodes[key][space][0][0] + ' ' + incomingXorNodes[key][space][0][1], str,
          {
            label: p,
            class: "edge-thickness-" + incomingXorNodes[key][space].length + " delay-coloring-" + bin
          })
      }
    }
  } else {
    for (var space in incomingXorNodes[key]) {
      var len = incomingXorNodes[key][space][0].length;
      if (len == 1) {
        g.setEdge(incomingXorNodes[key][space][0][0], key,
          {class: "edge-thickness-" + incomingXorNodes[key][space].length + " delay-coloring-0"})
      } else {
        let avg = getIncomingEdgeIndexDelay(nodes, key, incomingXorNodes[key][space][0][0] + ' ' + incomingXorNodes[key][space][0][1], incomingXorNodes[key][space].length);
        bin = computeAssignBin(avg, maxDelay, 1);
        let p = getProbabilityLabel(nodes, incomingXorNodes[key][space][0][0], incomingXorNodes[key][space][0][1], incomingXorNodes[key][space].length);
        g.setEdge(incomingXorNodes[key][space][0][0] + ' ' + incomingXorNodes[key][space][0][1], key,
          {
            label: p,
            class: "edge-thickness-" + incomingXorNodes[key][space].length + " delay-coloring-" + bin
          })
      }
    }
  }
}

function getProbability(nodes, key, status, length) {
  return (roundUp(length / nodes[key][status].statusArray.length * 100, 1));
}

function getProbabilityLabel(nodes, s1, s2, length) {
  if (s1.includes("start")) return '';
  s1 = s1.split('-');
  if (s1.length > 1) s1 = s1[1];
  else s1 = s1[0];

  let p = getProbability(nodes, s1, s2, length);
  if (p == 100) p = '';
  else p = p + '%';
  return p;
}

function updateComparisonUniqueness(word, comparisonTableData, key, status) {
  var dataUniqueness = comparisonTableData.uniqueness;
  var dataUniquenessNodes = comparisonTableData.uniquenessNodes;
  var dataNodeIpTp = comparisonTableData.nodeIpTp
  var sharedNodes = comparisonTableData.sharedNodes;
  var _word = word.split(' ');
  _word.sort().reverse();
  if (dataUniqueness[_word.length - 1] === undefined) {
    dataUniqueness[_word.length - 1] = 1;
    sharedNodes[_word.length - 1] = [];
    sharedNodes[_word.length - 1].push(key + ' ' + status);
  } else {
    dataUniqueness[_word.length - 1]++;
    sharedNodes[_word.length - 1].push(key + ' ' + status);
  }
  if (_word.length > 2) comparisonTableData.uniqueOverlapping.overlappingNodes.size++;
  else comparisonTableData.uniqueOverlapping.uniqueNodes.size++;
  var tPiP = "";
  for (let i = 0; i < _word.length - 1; i++) {
    let val = _word[i].split('-')[1];
    if (i) tPiP += '-' + val
    else tPiP += val
    if (dataNodeIpTp[val] === undefined) dataNodeIpTp[val] = 1;
    else dataNodeIpTp[val]++;
  }
  if (dataUniquenessNodes[tPiP] === undefined) {
    dataUniquenessNodes[tPiP] = {};
    dataUniquenessNodes[tPiP].counter = 1;
    dataUniquenessNodes[tPiP].nodes = [];
    if (status === undefined) dataUniquenessNodes[tPiP].nodes.push(key);
    else dataUniquenessNodes[tPiP].nodes.push(key + ' ' + status);
  } else {
    dataUniquenessNodes[tPiP].counter++;
    if (status === undefined) dataUniquenessNodes[tPiP].nodes.push(key);
    else dataUniquenessNodes[tPiP].nodes.push(key + ' ' + status);
  }
}

function createComparisonUniquenessTable(data) {
  function fx(data, arr) {
    for (var node in data) {
      if (node == 1) arr.push(["Unique Nodes", data[node]]);
      else arr.push([("Shared between " + node + " \n IP/TP"), data[node]]);
    }
  }
  return createPieChart(data, fx, "Uniqueness of Nodes");
}

function createComparisonNodeIpTpTable(data) {
  function fx(data, arr) {
    for (var node in data) {
      arr.push(["IP/TP-" + node, data[node]]);
    }
  }
  return createPieChart(data, fx, "IP/TP Number of Nodes")
}

function createConversationSharingNodes(data) {
  function fx(data, arr) {
    for (var elem in data) {
      const oldElem = elem;
      elem = elem.split('-');
      if (elem.length > 1) {
        arr.push(["IP/TP-" + oldElem, data[oldElem].counter]);
      } else {
        arr.push(["IP/TP-" + oldElem, data[oldElem].counter]);
      }
    }
  }
  return createPieChart(data, fx, "IP/TP Shared Nodes")
}

function createDynamicPieChart(data) {
  function fx(data, arr) {
    for (var elem in data) {
      const oldElem = elem;
      elem = elem.split('-');
      if (elem.length > 1) {
        arr.push(["IP/TP-" + oldElem, data[oldElem]]);
      } else {
        arr.push(["IP/TP-" + oldElem, data[oldElem]]);
      }
    }
  }
  return createPieChart(data, fx, "Dynamic Sharing PieChart")
}

function createPieChart(data, fx, title) {
  var arr = [];
  arr.push(["Task", "Hours Per Day"]);
  fx(data, arr);
  // Optional; add a title and set the width and height of the chart
  var options = {'title': title, 'width': "50%", 'height': "150px"};

  // Display the chart inside the <div> element with id="piechart"
  return {
    data: arr,
    options: options
  };
}
