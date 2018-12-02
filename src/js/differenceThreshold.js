function differenceThreshold(client) {
  client = sortLogs(client);
  let avg = 0;
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  let timePeriods = [];
  for (let i = 1; i < client.length; i++) {
    let date = new Date(client[i - 1].datetime);
    let date1 = new Date(client[i].datetime);
    let diff = Math.abs(date1 - date);
    avg += diff;
    if (max < diff) max = diff;
    if (min > diff) min = diff;
  }
  avg /= (client.length - 1);
  let diffThreshold = (min + max) / 2;
  let timeP = [];
  timeP.push(client[0]);
  for (let i = 1; i < client.length; i++) {
    let date = new Date(client[i - 1].datetime);
    let date1 = new Date(client[i].datetime);
    let diff = Math.abs(date1 - date);
    if (diff > diffThreshold) {
      if (timeP == []) timeP.push(client[i - 1]);
      timePeriods.push(timeP);
      timeP = [];
    }
    timeP.push(client[i]);
  }
  if (timeP != []) timePeriods.push(timeP);
  return timePeriods;
}

function sortLogs(clients) {
  clients.sort((a, b) => compare(a.datetime, b.datetime));
  return clients;
}

function compare(a, b) {
  a = new Date(a);
  b = new Date(b);
  if (a > b) return 1;
  else if (a === b) return 0;
  else return -1;
}
