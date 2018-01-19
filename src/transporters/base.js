const LOG = require('../common/logger')('TransporterBase');
const {PigalleMicroserviceBaseClass} = require('../common/');

class TransporterBase extends PigalleMicroserviceBaseClass {

  constructor(protocol, options) {
    super();
    this._servicesRegistry = options.servicesRegistry || (() => {
      throw new Error('Missing services registry');
    })();
    this.protocol = protocol.toLowerCase();
  }

  start() {
    throw new Error('start() is not implemented');
  }

}

module.exports = {
  TransporterBase: TransporterBase,
}
