const {PigalleMicroserviceBaseClass} = require('../common/');

class TransporterBase extends PigalleMicroserviceBaseClass {

  constructor(protocol) {
    super();
    this.protocol = protocol.toLowerCase();
  }

  register(service) {
    throw new Error('register() is not implemented');
  }

  start() {
    throw new Error('start() is not implemented');
  }

}

module.exports = {
  TransporterBase: TransporterBase,
}
