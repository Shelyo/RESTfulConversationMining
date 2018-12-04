
function generatePattern(pattern, size) {
  for (let i = 0; i < size; i++) {
    pattern[i] = {
      method: "*",
      url: "*",
      status: "*"
    }
  }
}


function visualizePattern(obj, value) {
  let i = 1;
  for (let node in obj) {
    obj[node].location = obj[node].url;
    if (obj[node].method === "*")
      obj[node].method = "any";

    let year = 1000, month = "1", day = "1",
      date = day + "/" + month + '/' + year,
      time = "00:00:" + i;

    obj[node].date = date;
    obj[node].time = time;
    obj[node].datetime = new Date(date);
    obj[node].datetime.setSeconds(i);
    i++;
  }

  let vizg = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {};
    });

  const start = "start-" + value;
  const end = "end-" + value;
  vizg.setNode(start, {shape: "circle", class: start});
  vizg.setNode(end, {shape: "circle", style: "stroke-width: 4; stroke: black", class: end});

  const length = Object.keys(obj).length, cl = obj;
  let nodes = [], incomingXorNodes = {}, endConnections = {};

  obj = seqPreservingComparison(cl, length, nodes, start, incomingXorNodes, end, value);

  incomingXorNodes = obj.incomingXorNodes;
  endConnections[value] = obj.endConnection.e1;
  nodes = obj.nodes;
  let statusObj = {},
    comparisonTableData = {
      timePorIP: [], uniqueOverlapping: {
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
    };

  const totalRequests = totalNumberOfRequests(nodes).total;
  obj = computeMinMaxAvgDelayVal(nodes);
  nodes = obj.nodes;
  let totalAvgKey = obj.totalAvgKey,
    maxDelay = obj.MAX,
    minDelay = obj.MIN;
  drawG(vizg, nodes, comparisonTableData, incomingXorNodes, totalAvgKey, maxDelay, minDelay, totalRequests, endConnections, statusObj);
  renderSvg(vizg, "#vizPattern");
}

function vizCandidatePattern() {
  const section = document.getElementById("candidatePatternsList");
  const options = section && section.options;
  const value = options[options.selectedIndex].value;
  if (globalCandidatePatterns !== undefined) {
    const obj = globalCandidatePatterns[value];
    visualizePattern(obj, value);
  } else
    console.log("NO CANDIDATE PATTERNS");
}

function generateCandidatePatterns(e) {
  e.preventDefault();
  cleanPredefinedCandidatePatterns();
  const candidateLengthNum = document.getElementById("candidateLength").value;
  const shareNum = document.getElementById("shareLvl").value;
  if (convDrawn !== undefined && convDrawn > 1 && convDrawn >= shareNum) {
    let pattern = {};
    generatePattern(pattern, candidateLengthNum);
    let obj = hasPatternWholeGraph(globalNodes, pattern, true, shareNum);
    if (obj.bool) {
      let mainDiv = document.getElementById("predefinedCandidatePatterns");
      const nodesViz = obj.matrixNodesVisualization.n;
      globalCandidatePatterns = nodesViz;
      let elem = document.createElement("select");
      elem.setAttribute("id", "candidatePatternsList");
      for (let i = 0; i < nodesViz.length; i++) {
        let option = document.createElement("option");
        let linkText = document.createTextNode("Candidate Pattern " + i);
        option.value = i;
        option.appendChild(linkText);
        elem.appendChild(option);
      }
      let div = document.getElementById("CandidatePatternMenu");
      let btn = document.createElement("BUTTON");
      let linkText = document.createTextNode("Visualize Candidate Pattern ");
      let btn1 = document.createElement("BUTTON");
      let linkText1 = document.createTextNode("Save Candidate Pattern");
      btn.appendChild(linkText);
      btn1.appendChild(linkText1);
      btn.setAttribute("id", "visualizeCandidatePattern");
      btn1.setAttribute("id", "saveCandidatePattern");
      btn.onclick = function () {
        vizCandidatePattern();
      };
      btn1.onclick = function () {
        saveCandidatePattern();
      };
      mainDiv.appendChild(elem);
      mainDiv.appendChild(btn1);
      mainDiv.appendChild(btn);
      div.appendChild(mainDiv);
    }
  } else
    console.log("Draw at least " + shareNum + " conversations");
}

function cleanPredefinedCandidatePatterns() {
  const elem = document.getElementById("predefinedCandidatePatterns");
  if (elem !== undefined) {
    while (elem.hasChildNodes()) {
      elem.removeChild(elem.childNodes[0])
    }
  }
}

function saveCandidatePattern() {
  const section = document.getElementById("candidatePatternsList");
  const options = section && section.options;
  const value = options[options.selectedIndex].value;
  if (globalCandidatePatterns !== undefined) {
    const obj = globalCandidatePatterns[value];
    const length = Object.keys(user_select_patterns).length;
    const val = "candidatePattern" + length;
    user_select_patterns[val] = obj;
    displayPatterns();
  } else
    console.log("NO CANDIDATE PATTERNS");
}

function displayPatterns() {
  let div = document.getElementById("predefinedPatterns");
  while (div.hasChildNodes())
    div.removeChild(div.childNodes[0]);
  for (let pattern in user_select_patterns) {
    let option = document.createElement("option");
    let linkText = document.createTextNode(pattern);
    option.appendChild(linkText);
    option.value = pattern;
    div.appendChild(option);
  }
}

function getPattern() {
  const file = document.getElementById('dataId');
  if (file.files.length) {
    console.log(file.files);
    let reader = new FileReader();

    reader.onload = function (e) {
      let pattern = e.target.result;
      pattern = pattern.split("\n");
      console.log(pattern);
    };
    for (let i = 0; i < file.files.length; i++) {
      reader.readAsText(file.files[i]);
    }
  }
}

function vizPattern() {
  const section = document.getElementById("predefinedPatterns");
  const options = section && section.options;
  const value = options[options.selectedIndex].value;
  const obj = user_select_patterns[value];
  if (obj !== undefined)
    visualizePattern(obj, value);
  else
    console.log("PUT PATTERNS");
}

function hasPatternClick() {
  if (globalGraph === undefined) console.log("Draw a graph");
  else {
    const section = document.getElementById("predefinedPatterns");
    const options = section && section.options;
    const value = options[options.selectedIndex].value;
    checkPatterns(user_select_patterns[value]);
  }
}

function checkPatterns(pattern) {
  if (globalGraph === undefined)
    console.log("GLOBAL GRAPH NOT SET UP");
  else {
    clearPatternMenu();
    let obj = hasPatternWholeGraph(globalNodes, pattern, false, convDrawn);
    if (obj.bool) {
      let div = document.getElementById("patternButtons");
      let newDiv = document.createElement("div");
      let x = document.createElement("INPUT");
      x.setAttribute("id", "vizPatternGraph");
      x.setAttribute("type", "checkbox");
      let label = document.createElement("LABEL");
      label.setAttribute("for", "vizPatternGraph");
      x.checked = true;
      setUpPatternVisualization(globalGraph, obj.matrixNodesVisualization);
      x.onclick = function () {
        let elem = document.getElementById("vizPatternGraph");
        let y = document.getElementsByTagName("STYLE")[6];
        y.disabled = elem.checked !== true;
      };
      let btn2 = document.createElement("p");
      let txt1 = document.createTextNode("Visualize Pattern In Graph");
      let txt2 = document.createTextNode("Pattern was FOUND");
      label.appendChild(txt1);
      btn2.appendChild(txt2);
      div.appendChild(btn2);
      newDiv.appendChild(x);
      div.appendChild(x);
      div.appendChild(label);
    }
  }
}

function clearPatternMenu() {
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

  while (div.hasChildNodes())
    div.removeChild(div.childNodes[0]);

  div.appendChild(btn1);
  div.appendChild(btn3);
  if (x[6] !== undefined)
    x[6].remove();
}

const disablePatternStyle = function () {
  let elem = document.getElementById("vizPatternGraph");
  let y = document.getElementsByTagName("STYLE")[6];
  if (elem && elem.checked) {
    y.disabled = true;
    elem.checked = false;
  }
};