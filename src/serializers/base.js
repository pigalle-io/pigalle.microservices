const {PigalleMicroserviceBaseClass} = require('../common/');

class SerializerBase extends PigalleMicroserviceBaseClass {
  constructor(serializerName) {
    super();
    this.name = serializerName;
  }

  serialize() {
    throw new Error('Not implemented');
  }

  unserialize() {
    throw new Error('Not implemented');
  }
}

module.exports = {
  SerializerBase: SerializerBase,
}
