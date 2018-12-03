

function displayClients() {
  let i = 0;
  let div = document.getElementById("multiSelect-Clients");
  for (let client in clients) {
    let option = document.createElement("option");
    let linkText = document.createTextNode(i + "-" + client);
    option.value = i + "-" + client;
    option.appendChild(linkText);
    div.appendChild(option);
    i++;
  }
}

function buildRules(ids, rules) {
  let obj = {}, ru, r;
  for (let rule in rules) {
    r = rule.split("-");
    let counter = rules[rule].counter;
    if (r.length === 1) {
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
          if (i === 0) ru = newArr[i];
          else ru = ru + ("-" + newArr[i]);
        }
        if (obj[ru] === undefined) obj[ru] = counter;
        else obj[ru] += counter;
      }
    }
  }
  return obj;
};

function setStyleShared(rainbow) {
  let sheet;
  if (document.getElementsByTagName("STYLE")[5] !== undefined)
    sheet = document.getElementsByTagName("STYLE")[5].sheet;
  for (let i = 0; i < rainbow.length; i++) {
    let clazz = ".enable-shared-" + (i + 1) + " .shared-" + (i + 1);
    let st = "fill: " + rainbow[i];
    sheet.insertRule(clazz + "{ " + st + " }");
  }
  document.getElementsByTagName("STYLE")[5].disabled = false;
};

function fixVisualizationConfig(nfc, eft, edc, sep, statusColoring) {

  nfc.checked = false;
  eft.checked = false;
  edc.checked = false;
  sep.checked = false;
  statusColoring.checked = false;
  deleteStyles();
  disableConversionPaths();
  clearPatternMenu();
};

function goBack() {
  window.history.back();
}