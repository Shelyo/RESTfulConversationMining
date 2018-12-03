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

  createRoutes(routes) {
    return routes.map((route) => {
      return Route(route);
    });
  }

  init() {
    const argv = process.argv;

    const links = (argv[2] && fs.readFileSync(argv[2], "utf8").split('\n'))  || fs.readFileSync("./data/logs/log3.txt", "ucs2").split(/\n+/);
    const routes = argv[3] && this.createRoutes(fs.readFileSync(argv[3], "ucs2").split('\n'));

    let data = {};
    data.FlatData = this.sortClientsByTime(this.clientSegmentation(this.parseLogs(links, undefined, true)));
    data.ParseRouteData = this.sortClientsByTime(this.clientSegmentation(this.parseLogs(links, routes)));
    data.SequentialData = this.sortClientsByTime(this.clientSegmentation(this.parseLogs(links)));

    const filepath = "data/output/data.js"
    const content = "const data = " + JSON.stringify(data);
    
    fs.writeFile(filepath, content, (err) => {
      if (err) throw err;
      console.log("The file was succesfully saved!");
    });
  }

}

new Parser().init();
