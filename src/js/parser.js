const fs = require('fs');
const Route = require('route-parser');

class Parser {

  parseLogs(logs, routes, flat) {
    let fields = ['date', 'time', 'ip', 'method', 'location', 'status'];

    return logs.map((log) => {
      let logObj = {};
      let logData = log.trim().split(/\s+/);

      fields.forEach((field, index) => logObj[field] = logData[index]);

      logObj = this.checkRoutes(routes, logObj, logData);
      if (flat) logObj['location'] = '/';

      return logObj;
    }).filter((e) => !Object.getOwnPropertyNames(e).length === 0);
  }

  checkRoutes(routes, logObj, logData) {
    if (routes) {
      routes.forEach(function(r) {
        if (r.match(logData[4])) {
          logData[4] = r.spec;
        }
      });
      logObj['location'] = logData[4];
    }
    return logObj;
  }

  clientSegmentation(logs) {
    let clients = {}
    logs.forEach((log, index) => {
      const ip = logs[index].ip;
      clients[ip]?  clients[ip].push(logs[index]) : [];
    });

    return clients;
  }

  compare(a, b) {
    if (a == b) return 0;
    return (a > b)? 1 : -1;
  }
  
  sortClientsByTime(clients) {
    // set datetime
    Object.keys(clients).forEach((ip) => {
      ip && clients[ip].forEach((_, i) => {
        const build1 = clients[ip][i].date.split('/')
        const build2 = clients[ip][i].time.split(':')

        let date = new Date();
        date.setDate(build1[0])
        date.setMonth(build1[1]-1)
        date.setFullYear(build1[2])
        date.setHours(build2[0])
        date.setMinutes(build2[1])
        date.setSeconds(build2[2])
        date.setMilliseconds(0);
        clients[ip][i].datetime = date;
      });
    })

    for (var ip in clients) clients[ip].sort((a,b) => this.compare(a.datetime,b.datetime));
    
    return clients;
  }

}

var links, routes;
var argv = process.argv;
if(argv[2] === undefined) links = fs.readFileSync("./data/logs/log3.txt", "ucs2").split(/\n+/);
else links = fs.readFileSync(argv[2], "utf8").split('\n')
if(argv[3] != undefined){
 routes = fs.readFileSync(argv[3], "ucs2").split('\n');
}
var createRoutes = function(routes){
var r = [];
for(let i = 0; i < routes.length; i++){
  r.push(new Route(routes[i]));
}
return r;
}
if(routes !== undefined) routes = createRoutes(routes);

var parser = new Parser();

var createData = function(links, routes, fx, flat){
  var logs;
  if (flat) {
    logs = fx(links, routes, flat);
  }
  else if(routes !== undefined){
    logs = fx(links, routes);
  }
  else{
    logs = fx(links);
  }
  var clients = parser.clientSegmentation(logs);
  clients = parser.sortClientsByTime(clients);
  return clients;
}

var parseRouteData, sequentialParser, flatParser;
if(routes !== undefined) parseRouteData = createData(links, routes, parser.parseLogs.bind(parser));
sequentialParser = createData(links, undefined, parser.parseLogs.bind(parser));
flatParser = createData(links, undefined, parser.parseLogs.bind(parser), true);
var data = {};
data.FlatData = flatParser;
data.ParseRouteData = parseRouteData;
data.SequentialData = sequentialParser;
// Save Data into the data.js file.
var filepath = "data/output/data.js"
var content = "var data = " + JSON.stringify(data);
fs.writeFile(filepath, content, (err) => {
  if (err) throw err;

  console.log("The file was succesfully saved!");
});
