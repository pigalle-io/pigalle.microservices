
const uuid = require('uuid');

const {PigalleMicroserviceBaseClass} = require('./common/');

const defaultsOpts = {
  transporter: {
    module: './transporters/tcp',
    options: {

    }
  },
};


class Microservice extends PigalleMicroserviceBaseClass {

  constructor(name, options) {
    super();
    this.name = name || uuid.v4();
    this._options = options || defaultsOpts;
  }

  expose(extension) {
    extension = extension || this._options.transporter.module;
    const Clazz = require(extension);
    console.log(Clazz);
    this._transporter = new Clazz(this._options.transporter.options);
    return this;
  }

  start() {
    if (!this._transporter) {
      throw new Error('Invalid transporter');
    }
    this._transporter.start();
  }

}

module.exports = {
  Microservice: Microservice,
}
