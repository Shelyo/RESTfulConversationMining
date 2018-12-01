var hasPatternWholeGraph = function(nodes, pattern, candidateP, shareNum){
  var placeholder = {};
  var oldpl;
  var nodesVisualization = [];
  var matrixNodesVisualization = {
    n : [],
    w : [],
  };
  var wholeNodesVisualization = [];
  setVisitedArray(nodes);
  for(var key in nodes){
    let space = key.split("/");
    let mt = space[0];
    let url = "/" + space.slice(1).join("/");
    if(identifyMethod(pattern[0], mt) && identifyURL(pattern[0], url, placeholder)){
      oldpl = placeholder;
      for(var status in nodes[key]){
        if(identifyStatus(pattern[0], status)){
          var fx = function(){
            nodesVisualization.push(setUpNode(mt, status, url));
            wholefollowUp(nodes, key, status, pattern, placeholder, 1, nodesVisualization, matrixNodesVisualization, candidateP, shareNum, nodes[key][status].tpIpArray, wholeNodesVisualization);
            placeholder = oldpl;
            nodesVisualization.splice(-1,1);
          }
          if(candidateP){
            if(nodes[key][status].tpIpArray.length > 1){
              fx();
            }
          }
          else{
            if(pattern[0].ips != undefined && pattern[0].ips > 1){
              shareNum = pattern[0].ips;
              if(nodes[key][status].tpIpArray.length > 1) fx();
            }
            else{
              fx();
            }
          }
        }
      }
    }
    placeholder = {};
    setVisitedArray(nodes);

  }
  if(matrixNodesVisualization.n.length > 0){
    return{
      bool : true,
      matrixNodesVisualization : matrixNodesVisualization
    }
  }
  return false;
}

var wholefollowUp = function(nodes, key, status, pattern, placeholder, j, nodesVisualization, matrixNodesVisualization, candidateP, shareNum, followUpArr, wholeNodesVisualization){
  var patternSize = Object.keys(pattern).length;
  if(j >= patternSize) return;
  if((pattern[j-1].status == "*" || pattern[j-1].status == "any") && j != 1){
    if(pattern[j].type == "whole"){
      wholeNodesVisualization.splice(-1,1);
      let slash = key.split('/');
      let method = slash[0];
      let newUrl = "/" + slash.slice(1).join("/");
      for(var st in nodes[key]){
        var node = setUpNode(method, st, newUrl)
        wholeNodesVisualization.push(node);
        wholeFx(nodes, key, st, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr, wholeNodesVisualization);
        wholeNodesVisualization.splice(-1,1);
      }
    }
    else{
      nodesVisualization.splice(-1,1);
      let slash = key.split('/');
      let method = slash[0];
      let newUrl = "/" + slash.slice(1).join("/");
      for(var st in nodes[key]){
        var node = setUpNode(method, st, newUrl)
        nodesVisualization.push(node);
        wholeFx(nodes, key, st, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr, wholeNodesVisualization);
        nodesVisualization.splice(-1,1);
      }
    }
  }
  else{
    wholeFx(nodes, key, status, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr, wholeNodesVisualization);
  }
  return;
}

var wholeFx = function(nodes, key, status, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr, wholeNodesVisualization){
  let oldPlaceholder = Object.assign({}, placeholder);
  for(let i = 0; i < nodes[key][status].statusArray.length; i++){
    let finalEnd = nodes[key][status].statusArray[i].finalEnd.split(' ');
    if(finalEnd.length > 1){
      let slash = finalEnd[0].split('/');
      let method = slash[0];
      let newUrl = "/" + slash.slice(1).join("/");
      let st = finalEnd[1];
      if(!nodes[key][status].visitedArray[i]){
        if(identifyMethod(pattern[j], method) && identifyStatus(pattern[j], st) && identifyURL(pattern[j], newUrl, placeholder)){
          var node = setUpNode(method, st, newUrl);
          var fx = function(){
            nodesVisualization.push(node);
            if(j+1 == patternSize){
              if(pattern[j].ips != undefined && pattern[j].ips > 1){
                if(nodes[finalEnd[0]][finalEnd[1]].tpIpArray.length >= pattern[j].ips){
                  var newArray = nodesVisualization.slice();
                  var newArr = wholeNodesVisualization.slice();
                  matrixNodesVisualization.n.push(newArray);
                  matrixNodesVisualization.w.push(newArr);
                }
              }
              else{
                var newArray = nodesVisualization.slice();
                var newArr = wholeNodesVisualization.slice();
                matrixNodesVisualization.n.push(newArray);
                matrixNodesVisualization.w.push(newArr);
              }
            }
            nodesVisualization.splice(-1,1);
            placeholder = oldPlaceholder;
          }
          var fx1 = function(){
            let obj = identifyCandidate(candidateP,  nodes[key][status].tpIpArray, shareNum, followUpArr, nodes[key][status].statusArray, nodes[key][status].visitedArray)
            if(obj.bool){
              if(obj.bool) followUpArr = obj.followUpArr;
              fx();
            }
          }
          if(candidateP){
            fx1();
          }
          else{
            shareNum = pattern[j-1].ips;
            followUpArr = nodes[key][status].tpIpArray;
            if(pattern[j-1].ips != undefined && pattern[j-1].ips > 1){
              fx1();
            }
            else{
              nodes[key][status].visitedArray[i] = true;
              fx();
            }

          }
        }
        else if(pattern[j].type == "whole"){
          nodes[key][status].visitedArray[i] = true;
          let node = setUpNode(method, st, newUrl);
          wholeNodesVisualization.push(node);
          var val = wholefollowUp(nodes, finalEnd[0], finalEnd[1], pattern, placeholder, j, nodesVisualization, matrixNodesVisualization, candidateP, shareNum, followUpArr, wholeNodesVisualization);
          wholeNodesVisualization.splice(-1,1);
        }
      }
    }
    else{
      nodes[key][status].visitedArray[i] = true;
    }
  }
  return;
}


var identifyMethod = function(m1, m2){
  if(m1.method == "*" || m1.method == "any") return true;
  else return (m1.method == m2);
}
var identifyStatus = function(s1, s2){
  if(s1.status == "*" || s1.status == "any") return true;
  else return (s1.status == s2);
}
var identifyURL = function(u1, u2, placeholder){
  if(u1.url[0] == "$"){
    if(placeholder[u1.url] === undefined){
      placeholder[u1.url] = u2;
      return true;
    }
    else{
      return placeholder[u1.url] == u2;
    }
  }
  else if(u1.url[0] == "/"){
    return (u1.url == u2);
  }
  else{
    return true;
  }
}
var identifyCandidate = function(candidateP, arr, shareNum, followUpArr, statusArray, visitedArray){
  if(candidateP || shareNum > 1){
    if(shareNum > arr.length) return false;
    else{
      let counter = 0;
      for(let i = 0; i < followUpArr.length; i++){
        if(arr.includes(followUpArr[i])){
          counter++;
        }
      }
      var fx = function(followUpArr){
        let newCounter = 0;
        let newArr = []
        let val = counter;
        let finalEnd;
        while(val >= shareNum){
          let combs = k_combinations(statusArray, val)
          for(let i = 0; i < combs.length; i++){
            finalEnd = combs[i][0].finalEnd;
            if(!visitedArray[combs[i][0].arrIndex]){
              newArr.push(combs[i][0].conv);
              for(let j = 1; j < combs[i].length; j++){
                if(combs[i][j].finalEnd == finalEnd && !visitedArray[combs[i][j].arrIndex]){
                  newArr.push(combs[i][j].conv);
                }
              }
              for(let k = 0; k < followUpArr.length; k++){
                if(newArr.includes(followUpArr[k])){
                  newCounter++;
                }
              }
              if(newCounter == counter || (newCounter >= shareNum && newCounter < followUpArr.length)){
                var revertVisited = [];
                for(let j = 0; j < combs[i].length; j++){
                  visitedArray[combs[i][j].arrIndex] = true;
                  revertVisited.push(combs[i][j].arrIndex);
                }
                return{
                  revertVisited : revertVisited,
                  bool : true,
                  followUpArr : newArr
                }
              }
              newArr = []
              newCounter = 0;
            }
          }
          val--;
        }
        return {
          revertVisited : [],
          bool : false
        }
      }
      if(counter == followUpArr.length){
        let obj = fx(followUpArr);
        if(obj.bool) return obj;
        else return false;
      }
      else if(counter >= shareNum && counter < followUpArr.length){
        followUpArr = arr;
        fx(followUpArr);
      }
    }
  }
  return true;
}

var setUpNode = function(method, status, url){
  var node = {}
  node.method = method;
  node.url = url;
  node.status = status;
  return node;
}
var setVisitedArray = function(nodes){
  for(var key in nodes){
    for(var status in nodes[key]){
      nodes[key][status].visitedArray = [];
      for(let i = 0; i < nodes[key][status].statusArray.length; i++){
        nodes[key][status].visitedArray[i] = false;
      }
    }
  }
}
var revertVisitedArray = function(visitedArray, revertVisited){
  for(let i = 0; i < revertVisited.length; i++){
    visitedArray[revertVisitedArray[i]] = false;
  }
}
var hasPattern = function(nodes, pattern, candidateP, shareNum){
  var placeholder = {};
  var oldpl;
  var nodesVisualization = [];
  var matrixNodesVisualization = [];
  setVisitedArray(nodes);
  for(var key in nodes){
    let space = key.split("/");
    let mt = space[0];
    let url = "/" + space.slice(1).join("/");
    if(identifyMethod(pattern[0], mt) && identifyURL(pattern[0], url, placeholder)){
      oldpl = placeholder;
      for(var status in nodes[key]){
        if(identifyStatus(pattern[0], status)){
          var fx = function(){
            nodesVisualization.push(setUpNode(mt, status, url));
            followUpPattern(nodes, key, status, pattern, placeholder, 1, nodesVisualization, matrixNodesVisualization, candidateP, shareNum, nodes[key][status].tpIpArray);
            placeholder = oldpl;
            nodesVisualization.splice(-1,1);
          }
          if(candidateP){
            if(nodes[key][status].tpIpArray.length > 1){
              fx();
            }
          }
          else{
            if(pattern[0].ips != undefined && pattern[0].ips > 1){
              shareNum = pattern[0].ips;
              if(nodes[key][status].tpIpArray.length > 1) fx();
            }
            else{
              fx();
            }
          }
        }
      }
    }
    placeholder = {};
    setVisitedArray(nodes);
  }
  if(matrixNodesVisualization.length > 0){
    return{
      bool : true,
      matrixNodesVisualization : matrixNodesVisualization
    }
  }
  return false;
}

var followUpPattern = function(nodes, key, status, pattern, placeholder, j, nodesVisualization, matrixNodesVisualization, candidateP, shareNum, followUpArr){
  var patternSize = Object.keys(pattern).length;
  if(j >= patternSize) return;
  if((pattern[j-1].status == "*" || pattern[j-1].status == "any") && j != 1){
    nodesVisualization.splice(-1,1);
    let slash = key.split('/');
    let method = slash[0];
    let newUrl = "/" + slash.slice(1).join("/");
    for(var st in nodes[key]){
      var node = setUpNode(method, st, newUrl)
      nodesVisualization.push(node);
      fx(nodes, key, st, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr);
      nodesVisualization.splice(-1,1);
    }
  }
  else{
    fx(nodes, key, status, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr);
  }
  return;
}
var fx = function(nodes, key, status, pattern, placeholder, j, nodesVisualization, patternSize, matrixNodesVisualization, candidateP, shareNum, followUpArr){
  let oldPlaceholder = Object.assign({}, placeholder);
  for(let i = 0; i < nodes[key][status].statusArray.length; i++){
    let finalEnd = nodes[key][status].statusArray[i].finalEnd.split(' ');
    if(finalEnd.length > 1){
      let slash = finalEnd[0].split('/');
      let method = slash[0];
      let newUrl = "/" + slash.slice(1).join("/");
      let st = finalEnd[1];
      if(identifyMethod(pattern[j], method) && identifyStatus(pattern[j], st) && identifyURL(pattern[j], newUrl, placeholder)){
        var node = setUpNode(method, st, newUrl)
        var fx = function(){
          nodesVisualization.push(node);
          if(j+1 == patternSize){
            var newArray = nodesVisualization.slice();
            matrixNodesVisualization.push(newArray);
          }
          var val = followUpPattern(nodes, finalEnd[0], finalEnd[1], pattern, placeholder, j+1, nodesVisualization, matrixNodesVisualization, candidateP, shareNum, followUpArr)
          nodesVisualization.splice(-1,1);
          placeholder = oldPlaceholder;
        }
        var fx1 = function(){
          let obj = identifyCandidate(candidateP,  nodes[key][status].tpIpArray, shareNum, followUpArr, nodes[key][status].statusArray, nodes[key][status].visitedArray)
          if(obj.bool){
            if(obj.bool) followUpArr = obj.followUpArr;
            fx();
          }
        }
        if(candidateP){
          fx1();
        }
        else{
          shareNum = pattern[j-1].ips;
          followUpArr = nodes[key][status].tpIpArray;
          if(pattern[j-1].ips != undefined && pattern[j-1].ips > 1){
            fx1();
          }
          else fx();
        }
      }
    }
  }
  return;
}
var setUpPatternVisualization = function(g, matrixNodesVisualization){
  let style = document.createElement('style')

  style.disabled = true;
  // WebKit hack :(
  style.appendChild(document.createTextNode(""));

  // Add the <style> element to the page
  document.head.appendChild(style);

  var rainbow = createRainbow(matrixNodesVisualization.n.length);
  var st = document.getElementsByTagName("STYLE")[6];
  var sheet = document.getElementsByTagName("STYLE")[6].sheet;
  var clazz;
  var fx = function(rainbow, nodesVisualization, j){
    for(let i = 0; i < nodesVisualization.length; i++){
      let key = nodesVisualization[i].method + nodesVisualization[i].url
      let st = "fill: "+rainbow[j];
      if(g._nodes[key] !== undefined){
        clazz = getPatternClassName(key, undefined);
        sheet.insertRule("."+clazz+"{ "+st+" }");
      }
      clazz = getPatternClassName(key, nodesVisualization[i].status);
      sheet.insertRule("."+clazz+"{ "+st+" }");
    }
  }
  for(let j = 0; j < matrixNodesVisualization.n.length; j++){
    var nodesVisualization = matrixNodesVisualization.n[j];
    fx(rainbow, nodesVisualization, j)
  }
  for(let i = 0; i < rainbow.length; i++){
    rainbow[i] = rgbToHex(getGradientColor([0, 0, 0], hexToRgb(rainbow[i]), 0.5));
  }
  for(let i = 0; i < matrixNodesVisualization.w.length; i++){
    var wholeNodesVisualization = matrixNodesVisualization.w[i];
    fx(rainbow, wholeNodesVisualization, i);
  }
  st.disabled = false;
}
var createRainbow = function(size){
  var rainbow = new Array(size);
  for (var i=0; i<size; i++) {
    var red   = sin_to_hex(i, 0 * Math.PI * 2/3, size); // 0   deg
    var blue  = sin_to_hex(i, 1 * Math.PI * 2/3, size); // 120 deg
    var green = sin_to_hex(i, 2 * Math.PI * 2/3, size); // 240 deg

    rainbow[i] = "#"+ red + green + blue;
  }
  return rainbow;
}
var getPatternClassName = function(key, status){
  let _key = key.split('/');
  let clazz = '';
  for(let i = 0; i < _key.length; i++){
    if(i == 0) clazz += _key[i]
    else clazz += ("-"+_key[i])
  }
  if(status !== undefined) clazz += "-"+status;
  return clazz;
}
//Link: https://gist.github.com/axelpale/3118596
function k_combinations(set, k) {
  var i, j, combs, head, tailcombs;

  // There is no way to take e.g. sets of 5 elements from
  // a set of 4.
  if (k > set.length || k <= 0) {
    return [];
  }

  // K-sized set has only one K-sized subset.
  if (k == set.length) {
    return [set];
  }

  // There is N 1-sized subsets in a N-sized set.
  if (k == 1) {
    combs = [];
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]]);
    }
    return combs;
  }

  // Assert {1 < k < set.length}

  // Algorithm description:
  // To get k-combinations of a set, we want to join each element
  // with all (k-1)-combinations of the other elements. The set of
  // these k-sized sets would be the desired result. However, as we
  // represent sets with lists, we need to take duplicates into
  // account. To avoid producing duplicates and also unnecessary
  // computing, we use the following approach: each element i
  // divides the list into three: the preceding elements, the
  // current element i, and the subsequent elements. For the first
  // element, the list of preceding elements is empty. For element i,
  // we compute the (k-1)-computations of the subsequent elements,
  // join each with the element i, and store the joined to the set of
  // computed k-combinations. We do not need to take the preceding
  // elements into account, because they have already been the i:th
  // element so they are already computed and stored. When the length
  // of the subsequent list drops below (k-1), we cannot find any
  // (k-1)-combs, hence the upper limit for the iteration:
  combs = [];
  for (i = 0; i < set.length - k + 1; i++) {
    // head is a list that includes only our current element.
    head = set.slice(i, i + 1);
    // We take smaller combinations from the subsequent elements
    tailcombs = k_combinations(set.slice(i + 1), k - 1);
    // For each (k-1)-combination we join it with the current
    // and store it to the set of k-combinations.
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}
