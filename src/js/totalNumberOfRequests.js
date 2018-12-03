function totalNumberOfRequests(nodes) {
  let counter = 0;
  let totalNumberOfRequests = {};
  let max = Number.MIN_VALUE;
  for (let key in nodes) {
    for (let status in nodes[key]) {
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
