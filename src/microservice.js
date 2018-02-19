const process = require('process');
const _ = require('lodash');
const uuid = require('uuid');

const LOG = require('./common/logger')('Microservice');
const {PigalleMicroserviceBaseClass} = require('./common/base');
const {ServicesRegistry} = require('./registries/services-registry');
const {Host} = require('./common/host');

const {UndefinedError} = require('@pigalle/core.erros.undefined');


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

  constructor(...args) {
    super();
    console.log('args.length=', args.length);
    let options, environment;
    if (args.length === 1) {
      environment = args[0];
      console.log('environment', environment)
    }
    if (args.length === 2) {
      options = args[0];
      environment = args[1];
      console.log('environment', environment)
    }
    this._name = this.constructor.name;
    if (_.isString(environment)) {
      this.env = JSON.parse(environment);
    } else {
      this.env = {};
    }
    this._options = _.merge(defaultsOpts, options);
    this._host = Host.get();
    this._host.printInterfaces();
    this.router = null;
  }

  _getChildrenServices() {
    return _.differenceWith(getAllMethods(this), getAllMethods(Microservice.prototype));
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
      throw new UndefinedError('Transporter is missing');
    }
    let servicesRegistryInitRetval = await this._transporter._servicesRegistry.init();
    return this._transporter.start();
  }

}

process.on('unhandledRejection', (err) => {
  LOG.error('Uncaught error', err)
  //process.exit(1)
});


module.exports = {};
module.exports.Microservice = Microservice;
