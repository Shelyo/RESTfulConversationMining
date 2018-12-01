
var pattern = {
  "0" : {
    method : "GET",
    status : "200"
  },
  "1" : {
    method : "DELETE",
    status : "500"
  },
}
var patternURL = {
  "0" : {
    method : "POST",
    status : "200",
    url : "/resource/edit"
  },
  "1" : {
    method : "POST",
    status : "401",
    url : "/resource"
  },
  "2" : {
    method : "POST",
    status : "201",
    url : "/"
  }
}
var patternWild = {
  "0" : {
    method : "OPTIONS",
    status : "404",
    url : "$1"
  },
  "1" : {
    method : "*",
    status : "404",
    url : "$2"
  },
  "2" : {
    method : "*",
    status : "500",
    url : "$1"
  },
  "3" : {
    method : "DELETE",
    status : "*",
    url : "$3"
  },
  "4" : {
    method : "OPTIONS",
    status : "*",
    url : "*",
  },
  "5" : {
    method : "DELETE",
    status : "204",
    "url" : "$4"
  },
  "6" : {
    method : "DELETE",
    status : "500",
    "url" : "$1"
  }
}
var patternMixed = {
  "0" : {
    method : "*",
    status : "*",
    url : "*"
  },
  "1" : {
    method : "DELETE",
    status : "*",
    url : "/last"
  },
  "2" : {
    method : "*",
    status : "500",
    url : "*"
  },
  "3" : {
    method : "POST",
    status : "*",
    url : "/prev"
  },
  "4" :{
    method : "PUT",
    status : "*",
    url : "*",
  },
  5 : {method: "DELETE", url: "/job/1", status: "*", type: "whole"}
}
  var ipPattern = {
    "0" : {
      method : "POST",
      status : "*",
      url : "*",
      ips : 4,
    },
    "1" :{
      method : "GET",
      status : "*",
      url : "*",
      ips : 4
    },
    "2" :{
      method : "POST",
      status : "*",
      url : "*",
      ips : 2,
    },
  }

  var candidatePattern= {
    0 : {method: "DELETE", url: "/last", status: "404"},
    1 : {method: "OPTIONS", url: "/job", status: "404"},
    2 : {method: "DELETE", url: "/last", status: "500"}
  }
  var wholePattern = {
    "0" : {method: "POST", url: "/poll", status: "*", type: "whole"},
    "1" : {method: "PUT", url: "$2", "status" : "*", type: "whole"}
}

var posterPattern = {
  "0" :
  {method: "POST", url:"/poll/1", status: "201"},
  "1" :
  {method: "DELETE", url:"/poll/1", status: "200"}
}

  var user_select_patterns = {patternURL : patternURL, patternWild : patternWild, patternMixed : patternMixed, candidatePattern : candidatePattern,
    ipPattern : ipPattern,
  wholePattern : wholePattern,
 ptrn :  posterPattern};
