

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