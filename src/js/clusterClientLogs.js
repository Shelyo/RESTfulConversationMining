/**
 * Given a list of clients, cluster them into smaller lists representing
 * close time intervals.
 *
 * @param {Array<Object>} clientLogs list of clients
 * @returns {Array<Array<Object>>} client logs clustered into lists of "close" time intervals
 */
function clusterClientLogs(clientLogs) {
  const sortedClientLogs = sortClientsByLogTime(clientLogs);

  // Get intervals and compute interval length threshold
  const intervals = computeIntervals(sortedClientLogs);
  const min = Math.min(...intervals);
  const max = Math.max(...intervals);
  const threshold = (min + max) / 2;

  // Aggregate clients into time periods (by closeness)
  return splitIntoClusters(clientLogs, intervals, threshold);
}

/**
 * Sort client logs by datetime.
 *
 * @param {Array<Object>} clientLogs list of clients
 * @returns {Array<Object>} sorted clientLogs
 */
function sortClientsByLogTime(clientLogs) {
  clientLogs.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return clientLogs;
}

/**
 * Compute intervals of time between client logs.
 *
 * @param {Array<Object>} clientLogs list of clients
 * @returns {Array<Number>} list of length of time intervals between client logs
 */
function computeIntervals(clientLogs) {
  const intervals = [];
  for (let i = 1; i < clientLogs.length; i++) {
    const d1 = new Date(clientLogs[i - 1].datetime);
    const d2 = new Date(clientLogs[i].datetime);
    intervals.push(Math.abs(d2 - d1));
  }
  return intervals;
}

/**
 *
 * @param {Array<Object>} clientLogs list of clients
 * @param {Array<Number>} intervals list of length of time intervals between client logs
 * @param {Number} tol tolerance value
 * @returns {Array<Array<Object>>} client logs clustered into lists of "close" time intervals
 */
function splitIntoClusters(clientLogs, intervals, tol) {
  const clientClusters = [];

  // First cluster contains first client by default
  let currCluster = [clientLogs[0]];

  for (let i = 1; i < clientLogs.length; i++) {
    // Get interval between current and previous client
    const interval = intervals[i - 1];

    // If interval is longer than tolerance, close current interval
    if (interval > tol) {
      clientClusters.push(currCluster);
      currCluster = [];
    }

    // Add client to current cluster (or to next cluster if it was cleared)
    currCluster.push(clientLogs[i]);
  }

  // Add last cluster if not trivial and return clusters
  if (currCluster.length !== 0) clientClusters.push(currCluster);
  return clientClusters;
}
