//Get the Data
var clients = localStorage.getItem('objectToPass');
clients = JSON.parse(clients);

// Create the list of Clients.
var displayClients = function () {
  let i = 0;
  var div = document.getElementById("multiSelect-Clients");
  var str = '';
  for (let client in clients) {
    let option = document.createElement("option");
    let linkText = document.createTextNode(i + "-" + client);
    option.value = i + "-" + client;
    option.appendChild(linkText);
    div.appendChild(option);
    i++;
  }
}
displayClients();

//LOAD Google Charts
var globalGraph, globalNodes, convDrawn, globalCandidatePatterns;
var generateCP = function (e) {
  e.preventDefault();
  cleanPredifinedCandidatePatterns();
  var candidateLengthNum = document.getElementById("candidateLength").value;
  var shareNum = document.getElementById("shareLvl").value;
  let pattern = generatePattern()
  if (convDrawn !== undefined && convDrawn > 1 && convDrawn >= shareNum) {
    let pattern = {}
    generatePattern(pattern, candidateLengthNum);
    let obj = hasPatternWholeGraph(globalNodes, pattern, true, shareNum);
    if (obj.bool) {
      let mainDiv = document.getElementById("predefinedCandidatePatterns");
      let nodesViz = obj.matrixNodesVisualization.n;
      globalCandidatePatterns = nodesViz;
      let elem = document.createElement("select");
      elem.setAttribute("id", "candidatePatternsList");
      for (let i = 0; i < nodesViz.length; i++) {
        let option = document.createElement("option");
        let linkText = document.createTextNode("Candidate Pattern " + i);
        option.value = i
        option.appendChild(linkText);
        elem.appendChild(option);
      }
      var div = document.getElementById("CandidatePatternMenu");
      var btn = document.createElement("BUTTON");
      let linkText = document.createTextNode("Visualize Candidate Pattern ");
      let btn1 = document.createElement("BUTTON");
      let linkText1 = document.createTextNode("Save Candidate Pattern");
      btn.appendChild(linkText);
      btn1.appendChild(linkText1);
      btn.setAttribute("id", "visualizeCandidatePattern");
      btn1.setAttribute("id", "saveCandidatePattern");
      btn.onclick = function () {
        vizCandidatePattern();
      }
      btn1.onclick = function () {
        saveCandidatePattern();
      }
      mainDiv.appendChild(elem);
      mainDiv.appendChild(btn1);
      mainDiv.appendChild(btn);
      div.appendChild(mainDiv);
    }
  } else console.log("Draw at least " + shareNum + " conversations");
}
var changeTp = function () {
  var section = document.getElementById("multiSelect-Clients");
  var options = section && section.options;
  var opt;
  var result = []
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
var saveCandidatePattern = function () {
  var section = document.getElementById("candidatePatternsList");
  var options = section && section.options;
  var value = options[options.selectedIndex].value;
  if (globalCandidatePatterns !== undefined) {
    var obj = globalCandidatePatterns[value];
    var length = Object.keys(user_select_patterns).length
    var val = "candidatePattern" + length;
    user_select_patterns[val] = obj;
    displayPatterns();
  } else console.log("NO CANDIDATE PATTERNS");
}
var cleanPredifinedCandidatePatterns = function () {
  var elem = document.getElementById("predefinedCandidatePatterns");
  if (elem !== undefined) {
    while (elem.hasChildNodes()) {
      elem.removeChild(elem.childNodes[0])
    }
  }
}

var generatePattern = function (pattern, size) {
  for (let i = 0; i < size; i++) {
    pattern[i] = {
      method: "*",
      url: "*",
      status: "*"
    }
  }
}
google.charts.load('current', {'packages': ['corechart']});

// Input related code goes here
function getPattern(e) {
  var x = e.preventDefault();
  var file = document.getElementById('dataId');
  if (file.files.length) {
    console.log(file.files);
    var reader = new FileReader();

    reader.onload = function (e) {
      pattern = e.target.result;
      pattern = pattern.split("\n");
      console.log(pattern);
    }
    for (let i = 0; i < file.files.length; i++) {
      reader.readAsText(file.files[i]);
    }
  }
}

$(document).ready(function () {
  var form = document.getElementById("formId")
  var form1 = document.getElementById("formCandidatePatterns");
  form1.onsubmit = generateCP;
  form.onsubmit = getPattern;
})
var displayPatterns = function () {
  var div = document.getElementById("predefinedPatterns");
  while (div.hasChildNodes()) div.removeChild(div.childNodes[0])
  for (let pattern in user_select_patterns) {
    let obj = user_select_patterns[pattern];
    let option = document.createElement("option");
    let linkText = document.createTextNode(pattern);
    option.appendChild(linkText);
    option.value = pattern;
    div.appendChild(option);
  }
}
displayPatterns();
var checkPatterns = function (pattern) {

  if (globalGraph === undefined) console.log("GLOBAL GRAPH NOT SET UP")
  else {
    clearPatternMenu();
    let obj = hasPatternWholeGraph(globalNodes, pattern, false, convDrawn);
    if (obj.bool) {
      let div = document.getElementById("patternButtons");
      let newDiv = document.createElement("div");
      var x = document.createElement("INPUT");
      x.setAttribute("id", "vizPatternGraph");
      x.setAttribute("type", "checkbox");
      let label = document.createElement("LABEL");
      label.setAttribute("for", "vizPatternGraph");
      x.checked = true;
      setUpPatternVisualization(globalGraph, obj.matrixNodesVisualization);
      x.onclick = function () {
        let elem = document.getElementById("vizPatternGraph");
        let y = document.getElementsByTagName("STYLE")[6];
        if (elem.checked != true) {
          y.disabled = true;
        } else {
          y.disabled = false;
        }
      }
      let btn2 = document.createElement("p");
      let txt1 = document.createTextNode("Visualize Pattern In Graph")
      let txt2 = document.createTextNode("Pattern was FOUND")
      label.appendChild(txt1);
      btn2.appendChild(txt2);
      div.appendChild(btn2);
      newDiv.appendChild(x);
      div.appendChild(x);
      div.appendChild(label);
    }
  }
}
var clearPatternMenu = function () {
  let div = document.getElementById("patternButtons");
  let x = document.getElementsByTagName("STYLE");
  let btn1 = document.createElement("BUTTON");
  let btn3 = document.createElement("BUTTON");
  let txt1 = document.createTextNode("Visualize");
  let txt3 = document.createTextNode("Search Whole Graph");
  btn1.onclick = vizPattern;
  btn3.onclick = hasPatternClick;
  btn1.appendChild(txt1);
  btn1.setAttribute("id", "visualizePattern");
  btn3.setAttribute("id", "wholeGraphSearch");
  btn3.appendChild(txt3);
  while (div.hasChildNodes()) div.removeChild(div.childNodes[0])
  div.appendChild(btn1);
  div.appendChild(btn3);
  if (x[6] !== undefined) x[6].remove();
}
var vizPattern = function () {
  var section = document.getElementById("predefinedPatterns");
  var options = section && section.options;
  var value = options[options.selectedIndex].value;
  var obj = user_select_patterns[value];
  if (obj !== undefined) visualizePattern(obj, value);
  else console.log("PUT PATTERNS");
}
var vizCandidatePattern = function () {
  var section = document.getElementById("candidatePatternsList");
  var options = section && section.options;
  var value = options[options.selectedIndex].value;
  if (globalCandidatePatterns !== undefined) {
    var obj = globalCandidatePatterns[value];
    visualizePattern(obj, value);
  } else console.log("NO CANDIDATE PATTERNS");
}
var visualizePattern = function (obj, value) {
  let i = 1;
  for (let node in obj) {
    let location = obj[node].url
    obj[node].location = location;
    if (obj[node].method == "*") obj[node].method == "any";
    let year = 1000;
    let month = "1";
    let day = "1";
    let date = day + "/" + month + '/' + year;
    let time = "00:00:" + i;
    obj[node].date = date;
    obj[node].time = time;
    obj[node].datetime = new Date(date);
    obj[node].datetime.setSeconds(i);
    i++;
  }
  console.log(obj);
  let vizg = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {};
    });
  let start = "start-" + value;
  let end = "end-" + value;
  vizg.setNode(start, {shape: "circle", class: start});
  vizg.setNode(end, {shape: "circle", style: "stroke-width: 4; stroke: black", class: end})
  let length = Object.keys(obj).length;
  let cl = obj;
  let nodes = [];
  let incomingXorNodes = {};
  var endConnections = {};
  obj = seqPreservingComparison(cl, length, nodes, start, incomingXorNodes, end, value);
  incomingXorNodes = obj.incomingXorNodes;
  endConnections[value] = obj.endConnection.e1;
  nodes = obj.nodes;
  var statusObj = {};
  var comparisonTableData = {
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
    sharedNodes: {}
  }
  var totalRequestsData = totalNumberOfRequests(nodes);
  var totalRequests = totalRequestsData.total;
  obj = computeMinMaxAvgDelayVal(nodes);
  nodes = obj.nodes;
  var totalAvgKey = obj.totalAvgKey;
  var maxDelay = obj.MAX;
  var minDelay = obj.MIN;
  drawG(vizg, nodes, comparisonTableData, incomingXorNodes, totalAvgKey, maxDelay, minDelay, totalRequests, endConnections, statusObj);
  renderSvg(vizg, "#vizPattern");
}
var disablePatternStyle = function () {
  let elem = document.getElementById("vizPatternGraph");
  var y = document.getElementsByTagName("STYLE")[6];
  if (elem && elem.checked) {
    y.disabled = true
    elem.checked = false;
  }
}
var hasPatternClick = function (e) {
  if (globalGraph === undefined) console.log("Draw a graph")
  else {
    var section = document.getElementById("predefinedPatterns");
    var options = section && section.options;
    var value = options[options.selectedIndex].value;
    checkPatterns(user_select_patterns[value]);
  }
}
var displayTimePeriods = function (client) {
  var el = document.getElementById("multiSelect");
  var form = document.getElementById("multiSelectForm");
  var timePeriods = differenceThreshold(client);
  var str = "";
  for (let i = 0; i < timePeriods.length; i++) {
    str += '<option value=\'' + i + '\'> Time Period ' + i + '</option>'
  }
  form.onclick = function () {
    var elem1 = document.getElementById("multiSelect");
    var elem2 = document.getElementById("multiSelect-Clients");
    var ret1 = getSelectedIPs(timePeriods, elem1);
    var ret2 = getSelectedIPs(clients, elem2);

    if (Object.keys(ret1).length) drawGraph(ret1);
    else drawGraph(ret2);
  }
  el.innerHTML = str;
}
var fixVisualizationConfig = function (nfc, eft, edc, sep, statusColoring) {

  nfc.checked = false;
  eft.checked = false;
  edc.checked = false;
  sep.checked = false;
  statusColoring.checked = false;
  deleteStyles();
  disableConversionPaths();
  clearPatternMenu();
}
//Draw the Graph for the selected IP.
var drawGraph = function (dataObject) {
  var g = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {};
    });
  globalGraph = g;
  var nfc = document.getElementById("nfc");
  var eft = document.getElementById("eft");
  var edc = document.getElementById("edc");
  var sep = document.getElementById("sep");
  var statusColoring = document.getElementById("statusColoring");

  fixVisualizationConfig(nfc, eft, edc, sep, statusColoring);
  // Here we"re setting nodeclass, which is used by our custom drawNodes function
  // below.
  var statusObj = {};
  var obj;
  var endConnections = {};
  var nodes = []
  var incomingXorNodes = {}
  var totalTpIpArray = []
  var comparisonTableData = {
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
  }
  for (let client in dataObject) {
    let start = "start-" + client;
    g.setNode(start, {shape: "circle", class: "start" + " tpIpColoring-" + client});
    g.setNode("end-" + client, {
      shape: "circle",
      style: "stroke-width: 4; stroke: black",
      class: "start" + " tpIpColoring-" + client
    })
    let length = dataObject[client].length;
    let cl = dataObject[client];
    obj = seqPreservingComparison(cl, length, nodes, start, incomingXorNodes, "end-" + client, client);
    totalTpIpArray.push(client);
    incomingXorNodes = obj.incomingXorNodes;
    endConnections[client] = obj.endConnection.e1;
    comparisonTableData.timePorIP.push(client);
    nodes = obj.nodes;
  }
  var totalRequestsData = totalNumberOfRequests(nodes);
  var totalRequests = totalRequestsData.total;
  var maxRequests = totalRequestsData.maxRequests;
  obj = computeMinMaxAvgDelayVal(nodes);
  nodes = obj.nodes;
  var totalAvgKey = obj.totalAvgKey;
  var maxDelay = obj.MAX;
  var minDelay = obj.MIN;
  drawG(g, nodes, comparisonTableData, incomingXorNodes, totalAvgKey, maxDelay, minDelay, totalRequests, endConnections, statusObj);
  setNodeClasses(g, nodes, totalRequestsData);
  setVisualizationConfig(nfc, eft, edc, sep, statusColoring, maxRequests, statusObj);
  var rainbows = conversionPath("tpIpColoring", totalTpIpArray.length, totalTpIpArray, comparisonTableData.uniquenessNodes);

  var convSharingNodes = createConversationSharingNodes(comparisonTableData.uniquenessNodes);
  var numOfSharedNodes = createComparisonUniquenessTable(comparisonTableData.uniqueness);
  var numOfNodes = createComparisonNodeIpTpTable(comparisonTableData.nodeIpTp);
  var sharedNodesRainbow = createRainbow(Object.keys(comparisonTableData.uniqueness).length);
  globalNodes = nodes;
  globalGraph = g;
  convDrawn = totalTpIpArray.length;
  console.log(comparisonTableData);
  let chart1 = displayPieChar(numOfNodes.data, numOfNodes.options, "piechart-1", rainbows.nodesRainbow, undefined);
  let chart2 = displayPieChar(numOfSharedNodes.data, numOfSharedNodes.options, "piechart-2", sharedNodesRainbow, undefined);
  let chart3 = displayPieChar(convSharingNodes.data, convSharingNodes.options, "piechart-3", rainbows.pieChartRainbow, comparisonTableData.uniquenessNodes);
  var eventHandlerPieCharts = function (chart, data) {
    let row = chart.getSelection();
    if (row.length > 0) {
      row = row[0].row;
      let value = data.getValue(row, 0);
      value = value.split(" ");
      console.log(value[2]);
      console.log(document.body.classList)
      if (value.length == 2) document.body.classList.toggle("enable-shared-" + 1)
      else document.body.classList.toggle("enable-shared-" + value[2]);
    }
    chart.setSelection([]);
  }
  setStyleShared(sharedNodesRainbow);
  google.visualization.events.addListener(chart2, "select", function () {
    eventHandlerPieCharts(chart2, google.visualization.arrayToDataTable(numOfSharedNodes.data))
  })
  renderSvg(g, "svg#restalk", rainbows.dynamicPieChartRainbow, comparisonTableData.uniquenessNodes);
}
var setStyleShared = function (rainbow) {
  var sheet;
  if (document.getElementsByTagName("STYLE")[5] !== undefined) sheet = document.getElementsByTagName("STYLE")[5].sheet;
  for (let i = 0; i < rainbow.length; i++) {
    let clazz = ".enable-shared-" + (i + 1) + " .shared-" + (i + 1);
    let st = "fill: " + rainbow[i];
    sheet.insertRule(clazz + "{ " + st + " }");
  }
  document.getElementsByTagName("STYLE")[5].disabled = false;
}
var renderSvg = function (g, clazz, rainbow, rules) {
  var svg = d3.select(clazz);
  svg.select("g").remove();
  var inner = svg.append("g");

  // Set up zoom support
  var zoom = d3.zoom().on("zoom", function () {
    inner.attr("transform", d3.event.transform);
  });
  svg.call(zoom);
  // Create the renderer
  var render = new dagreD3.render();
  // Run the renderer. This is what draws the final graph.
  render(inner, g);
  // Center the graph
  var initialScale = 0.2;
  svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
  svg.selectAll("g.node.start").on("click", function (id) {
    var _node = g.node(id);
    var n = id.split("start-")[1];
    document.body.classList.toggle("enable-path-" + n);
    let arr = document.body.classList.value;
    arr = arr.split(" ");
    if (arr[0] != "") {
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

function goBack() {
  window.history.back();
}

var buildRules = function (ids, rules) {
  let obj = {};
  let ru;
  for (var rule in rules) {
    r = rule.split("-");
    let counter = rules[rule].counter;
    if (r.length == 1) {
      if (ids.includes(r[0])) {
        obj[rule] = counter;
      }
    } else {
      let newArr = [];
      for (let i = 0; i < r.length; i++) {
        if (ids.includes(r[i])) {
          newArr.push(r[i]);
        }
      }
      if (newArr.length > 0) {
        ru = "";
        for (let i = 0; i < newArr.length; i++) {
          if (i == 0) ru = newArr[i];
          else ru = ru + ("-" + newArr[i]);
        }
        if (obj[ru] === undefined) obj[ru] = counter;
        else obj[ru] += counter;
      }
    }
  }
  return obj;
}

function displayPieChar(arr, options, id, rainbow, rules) {
  data = google.visualization.arrayToDataTable(arr);
  if (id === "piechart-3" || id == "piechart-4") {
    options.colors = []
    for (var rule in rules) {
      options.colors.push(rainbow[rule]);
    }
  } else {
    options.colors = []
    for (let i in rainbow) {
      options.colors.push(rainbow[i]);
    }
  }
  let chart = new google.visualization.PieChart(document.getElementById(id));
  chart.style = "display: block";
  chart.draw(data, options);
  return chart;
}