const process = require('process');
const _ = require('lodash');
const uuid = require('uuid');

const LOG = require('./common/logger')('Microservice');
const {PigalleMicroserviceBaseClass} = require('./common/base');
const {ServicesRegistry} = require('./registries/services-registry');
const {Host} = require('./common/host');


const defaultsOpts = {
  namespace: 'default',
  transporter: {
    module: './transporters/tcp',
    options: {}
  },
};

const getAllMethods = (obj) => {
  let props = []

  do {
    const l = Object.getOwnPropertyNames(obj)
      .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
      .sort()
      .filter((p, i, arr) =>
        typeof obj[p] === 'function' &&  //only the methods
        p !== 'constructor' &&           //not the constructor
        (i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
        props.indexOf(p) === -1 &&          //not overridden in a child
        (!_.startsWith(p, '_')) && // not a private method.
        (p !== 'setUp')
      )
    props = props.concat(l)
  }
  while (
    (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
    Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
    )

  return props;
}



class Microservice extends PigalleMicroserviceBaseClass {

  constructor(options) {
    super();
    this._name = this.constructor.name;
    this._options = _.merge(defaultsOpts, options);
    this._host = Host.get();
    this._host.printInterfaces();
  }

  _getChildrenServices() {
    return _.differenceWith(getAllMethods(this), getAllMethods(Microservice.prototype))
  }

  _createServicesRegistryForTransporter() {
    this._options.transporter.options.servicesRegistry = new ServicesRegistry(this._options.namespace, this._name, this, this._getChildrenServices());
    return this;
  }

  expose(extension) {
    this._createServicesRegistryForTransporter();
    extension = extension || this._options.transporter.module;
    const Clazz = require(extension);
    this._transporter = new Clazz(this._options.transporter.options);
    return this;
  }

  async start() {
    if (!this._transporter) {
      throw new Error('Invalid transporter');
    }
    let servicesRegistryInitRetval = await this._transporter._servicesRegistry.init();
    return this._transporter.start();
  }

  static factory(options) {
    return new (this.prototype.constructor)(options);
  }

}

process.on('unhandledRejection', (err) => {
  LOG.error('Uncaught error', err)
  //process.exit(1)
});


module.exports = {};
module.exports.Microservice = Microservice;
