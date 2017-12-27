
const {SerializerBase} = require('./base');

class JsonSerializer extends SerializerBase {
  constructor(options) {
    super('json');
  }

  serialize(o) {
    try {
      return JSON.stringify(o);
    } catch (e) {
      throw new Error(e);
    }
  }

  unserialize(o) {
    try {
      return JSON.parse(o);
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = JsonSerializer;