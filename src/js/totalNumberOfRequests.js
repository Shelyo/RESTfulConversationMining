function totalNumberOfRequests(nodes) {
  console.log("OOOOOOOO");
  var counter = 0;
  var totalNumberOfRequests = {};
  var max = Number.MIN_VALUE;
  for (var key in nodes) {
    for (var status in nodes[key]) {
      counter += (nodes[key][status].statusArray.length);
    }
    totalNumberOfRequests[key] = counter;
    if (max < counter) {
      max = counter;
    }
    counter = 0;
  }
  return {
    "total": totalNumberOfRequests,
    "maxRequests": max
  };
}
