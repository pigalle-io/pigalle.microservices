const os = require('os');

const {PigalleMicroserviceBaseClass} = require('./base');

class Host extends PigalleMicroserviceBaseClass {

  constructor() {
    super();
    this._init();
  }

  static get() {
    return new Host();
  }

  _init() {
    return this._fillHostname()._fillInterfaces();
  }

  _fillInterfaces() {
    this._interfaces = os.networkInterfaces();
    return this;
  }

  _fillHostname() {
    this._hostname = os.hostname();
    return this;
  }

  printInterfaces() {
    const ifaces = this._interfaces;
    Object.keys(ifaces).forEach((ifname) => {
      let alias = 0;
      ifaces[ifname].forEach((iface) => {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 adress
          console.log(ifname, iface.address);
        }
        ++alias;
      });
    });
  }


}

module.exports = {};
module.exports.Host = Host;
