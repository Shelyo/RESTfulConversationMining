
function renderSvg(g, clazz, rainbow, rules) {
  let svg = d3.select(clazz);
  svg.select("g").remove();
  let inner = svg.append("g");

  // Set up zoom support
  const zoom = d3.zoom().on("zoom", function () {
    inner.attr("transform", d3.event.transform);
  });
  svg.call(zoom);
  // Create the renderer
  let render = new dagreD3.render();
  // Run the renderer. This is what draws the final graph.
  render(inner, g);
  // Center the graph
  const initialScale = 0.2;
  svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
  svg.selectAll("g.node.start").on("click", function (id) {
    const n = id.split("start-")[1];
    document.body.classList.toggle("enable-path-" + n);
    let arr = document.body.classList.value;
    arr = arr.split(" ");
    if (arr[0] !== "") {
      let ids = [];
      for (let i = 0; i < arr.length; i++) {
        ids.push(arr[i].split("enable-path-")[1]);
      }
      let data = buildRules(ids, rules);
      let dynamicData = createDynamicPieChart(data);
      displayPieChar(dynamicData.data, dynamicData.options, "piechart-4", rainbow, data);
    } else {
      let div = document.getElementById("piechart-4");
      while (div.hasChildNodes()) div.removeChild(div.childNodes[0])
    }
    console.log("Clicked " + id);
  });
}

const changeTimePeriod = function () {
  const section = document.getElementById("multiSelect-Clients");
  const options = section && section.options;
  let opt;
  let result = [];
  for (let i = 0, iLen = options.length; i < iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      let iptp = opt.value.split('-');
      let val = iptp;
      let val1 = iptp;
      if (iptp.length > 1) {
        val = iptp[0];
        val1 = iptp[1]
      }
      let res = ((clients[val1] || clients[parseInt(opt.text)]));
      for (let j = 0; j < res.length; j++) {
        result.push(res[j]);
      }
    }
  }
  displayTimePeriods(result);
}

function displayTimePeriods(client) {
  let el = document.getElementById("multiSelect");
  let form = document.getElementById("multiSelectForm");
  const timePeriods = clusterClientLogs(client);
  let str = "";
  for (let i = 0; i < timePeriods.length; i++) {
    str += '<option value=\'' + i + '\'> Time Period ' + i + '</option>'
  }
  form.onclick = function () {
    const ret1 = getSelectedIPs(timePeriods, document.getElementById("multiSelect"));
    const ret2 = getSelectedIPs(clients, document.getElementById("multiSelect-Clients"));

    if (Object.keys(ret1).length)
      drawGraph(ret1);
    else
      drawGraph(ret2);
  };
  el.innerHTML = str;
}

//Draw the Graph for the selected IP.
function drawGraph(dataObject) {

  let g = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {};
    });

  // globalGraph = g;
  let nfc = document.getElementById("nfc"),
    eft = document.getElementById("eft"),
    edc = document.getElementById("edc"),
    sep = document.getElementById("sep"),
    statusColoring = document.getElementById("statusColoring");

  fixVisualizationConfig(nfc, eft, edc, sep, statusColoring);
  // Here we"re setting nodeclass, which is used by our custom drawNodes function
  // below.
  let statusObj = {},
    obj,
    endConnections = {},
    nodes = [],
    incomingXorNodes = {},
    totalTpIpArray = [];

  let comparisonTableData = {
    timePorIP: [],
    uniqueOverlapping: {
      uniqueNodes: {
        size: 0,
      },
      overlappingNodes: {
        size: 0,
      },
      uniqueEdges: {size: 0,},
      overlappingEdges: {size: 0,},
    },
    uniqueness: {},
    uniquenessNodes: {},
    nodeIpTp: {},
    sharedNodes: {},
  };

  let start, length, cl;
  for (let client in dataObject) {

    start = "start-" + client;
    g.setNode(start, {shape: "circle", class: "start" + " tpIpColoring-" + client});
    g.setNode("end-" + client, {
      shape: "circle",
      style: "stroke-width: 4; stroke: black",
      class: "start" + " tpIpColoring-" + client
    });

    length = dataObject[client].length;
    cl = dataObject[client];
    obj = seqPreservingComparison(cl, length, nodes, start, incomingXorNodes, "end-" + client, client);
    totalTpIpArray.push(client);
    incomingXorNodes = obj.incomingXorNodes;
    endConnections[client] = obj.endConnection.e1;
    comparisonTableData.timePorIP.push(client);
    nodes = obj.nodes;
  }

  const totalRequestsData = totalNumberOfRequests(nodes),
    totalRequests = totalRequestsData.total,
    maxRequests = totalRequestsData.maxRequests;

  obj = computeMinMaxAvgDelayVal(nodes);
  nodes = obj.nodes;

  const totalAvgKey = obj.totalAvgKey,
    maxDelay = obj.MAX,
    minDelay = obj.MIN;

  drawG(g, nodes, comparisonTableData, incomingXorNodes, totalAvgKey, maxDelay, minDelay, totalRequests, endConnections, statusObj);
  setNodeClasses(g, nodes, totalRequestsData);
  setVisualizationConfig(nfc, eft, edc, sep, statusColoring, maxRequests, statusObj);

  const rainbows = conversionPath("tpIpColoring", totalTpIpArray.length, totalTpIpArray, comparisonTableData.uniquenessNodes);

  const convSharingNodes = createConversationSharingNodes(comparisonTableData.uniquenessNodes),
    numOfSharedNodes = createComparisonUniquenessTable(comparisonTableData.uniqueness),
    sharedNodesRainbow = createRainbow(Object.keys(comparisonTableData.uniqueness).length);
  let  numOfNodes = createComparisonNodeIpTpTable(comparisonTableData.nodeIpTp);

  globalNodes = nodes;
  globalGraph = g;
  convDrawn = totalTpIpArray.length;

  let chart1 = displayPieChar(numOfNodes.data, numOfNodes.options, "piechart-1", rainbows.nodesRainbow, undefined);
  let chart2 = displayPieChar(numOfSharedNodes.data, numOfSharedNodes.options, "piechart-2", sharedNodesRainbow, undefined);
  let chart3 = displayPieChar(convSharingNodes.data, convSharingNodes.options, "piechart-3", rainbows.pieChartRainbow, comparisonTableData.uniquenessNodes);

  const eventHandlerPieCharts = function (chart, data) {
    let row = chart.getSelection();
    if (row.length > 0) {
      row = row[0].row;
      let value = data.getValue(row, 0);
      value = value.split(" ");

      if (value.length === 2) document.body.classList.toggle("enable-shared-" + 1);
      else document.body.classList.toggle("enable-shared-" + value[2]);
    }
    chart.setSelection([]);
  };

  setStyleShared(sharedNodesRainbow);

  google.visualization.events.addListener(chart2, "select", function () {
    eventHandlerPieCharts(chart2, google.visualization.arrayToDataTable(numOfSharedNodes.data))
  });

  renderSvg(g, "svg#restalk", rainbows.dynamicPieChartRainbow, comparisonTableData.uniquenessNodes);
}

function displayPieChar(arr, options, id, rainbow, rules) {
  data = google.visualization.arrayToDataTable(arr);
  if (id === "piechart-3" || id == "piechart-4") {
    options.colors = [];
    for (let rule in rules) {
      options.colors.push(rainbow[rule]);
    }
  } else {
    options.colors = [];
    for (let i in rainbow) {
      options.colors.push(rainbow[i]);
    }
  }
  let chart = new google.visualization.PieChart(document.getElementById(id));
  chart.style = "display: block";
  chart.draw(data, options);
  return chart;
}