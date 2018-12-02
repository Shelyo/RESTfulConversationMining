function getSelectedIPs(clients, elem) {
  let result = {};
  let options = elem && elem.options;
  let opt;
  for (let i = 0, iLen = options.length; i < iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      let iptp = opt.value.split('-');
      let val = iptp;
      let val1 = iptp;
      if (iptp.length > 1) {
        val = iptp[0];
        val1 = iptp[1]
      }
      result[val] = (clients[val1] || clients[parseInt(opt.text)]);
    }
  }
  return result;
}
