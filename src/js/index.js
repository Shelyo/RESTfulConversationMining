
/* onload function */
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById("formId").onsubmit = generateCandidatePatterns;
  document.getElementById("formCandidatePatterns").onsubmit = getPattern;
}, false);

/* Get data from the LocalStorage */

let clients = localStorage.getItem('objectToPass');
clients = JSON.parse(clients);

/* Create the list of Clients. */
displayClients();

let globalGraph, globalNodes, convDrawn, globalCandidatePatterns;

google.charts.load('current', {'packages': ['corechart']});

displayPatterns();