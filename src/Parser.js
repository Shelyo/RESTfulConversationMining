var fs = require('fs');
const Route = require('route-parser');

//Read the file and parse it to objects
var readParseFile = function(links){
  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : spaces[3], location: spaces[4], status : spaces[5]}
      logs.push(obj);
    }
  }
  return logs;
}

//Read the file and parse it to objects
//assumes there are routes passed as second parameter
var readParseURLRouteFile = function(links, routes){

  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      var url = spaces[4];

      routes.forEach(function(r) {
        if (r.match(url)) {
          url = r.spec;
        }
      })

      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : spaces[3], location: url, status : spaces[5]}
      logs.push(obj);
    }
  }
  return logs;
}

var flatProcessingOfFile = function(links){
  var logs = [];
  for(let i = 0; i < links.length; i++){
    let str = links[i];
    if(str != ''){
      let spaces = str.trim().split(/\s+/);
      let obj = {date : spaces[0], time : spaces[1], ip : spaces[2], method : spaces[3], location: "/", status : spaces[5]}
      logs.push(obj);
    }
  }
  return logs;
}

//Client segmentation.
var clientSegmentation = function(logs){
  var clients = {}
  for(let i = 0; i < logs.length; i++){
    var ip = logs[i].ip;
    if(clients[ip] === undefined) {
      clients[ip] = [];
    }
    clients[ip].push(logs[i]);
  }
  return clients;
}

//Sort Each Client by time/date.
var compare = function(a,b) {
  if(a > b) return 1
  else if (a === b) return 0
  else return -1
}
var sortClientByDateTime = function(clients){
  for(var ip in clients){
    if(ip !== undefined){
      for(let i = 0; i < clients[ip].length; i++){
        let build1 = clients[ip][i].date.split('/')
        let build2 = clients[ip][i].time.split(':')
        let date = new Date();
        date.setDate(build1[0])
        date.setMonth(build1[1]-1)
        date.setFullYear(build1[2])
        date.setHours(build2[0])
        date.setMinutes(build2[1])
        date.setSeconds(build2[2])
        date.setMilliseconds(0);
        clients[ip][i].datetime = date;
      }
    }
  }
  for(var ip in clients){
    clients[ip].sort((a,b) => compare(a.datetime,b.datetime));
  }
  return clients;
}

var links, routes;
var argv = process.argv;
if(argv[2] === undefined) links = fs.readFileSync("./log2.txt", "ucs2").split('\n');
else links = fs.readFileSync(argv[2], "utf8").split('\n')
if(argv[3] != undefined){
 routes = fs.readFileSync(argv[3], "utf8").split('\n');
}
var createRoutes = function(routes){
var r = [];
for(let i = 0; i < routes.length; i++){
  r.push(new Route(routes[i]));
}
return r;
}
if(routes !== undefined) routes = createRoutes(routes);

var createData = function(links, routes, fx){
  var logs;
  if(routes !== undefined){
    logs = fx(links, routes);
  }
  else{
    logs = fx(links);
  }
  var clients = clientSegmentation(logs);
  clients = sortClientByDateTime(clients);
  return clients;
}

var parseRouteData, sequentialParser, flatParser;
if(routes !== undefined) parseRouteData = createData(links, routes, readParseURLRouteFile);
sequentialParser = createData(links, undefined, readParseFile);
flatParser = createData(links, undefined, flatProcessingOfFile);
var data = {};
data.FlatData = flatParser;
data.ParseRouteData = parseRouteData;
data.SequentialData = sequentialParser;
// Save Data into the data.js file.
var filepath = "data.js"
var content = "var data = " + JSON.stringify(data);
fs.writeFile(filepath, content, (err) => {
  if (err) throw err;

  console.log("The file was succesfully saved!");
});
