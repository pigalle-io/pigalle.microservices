
const {SerializerBase} = require('./base');

class JsonSerializer extends SerializerBase {
  constructor(options) {
    super('json');
  }

  serialize(o) {
    try {
      JSON.stringify(o)
    } catch (e) {
      throw new Error(e);
    }
  }

  unserialize(o) {
    try {
      JSON.parse(o)
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = JsonSerializer;