const _ = require('lodash');

const LOG = require('../common/logger')('ServicesRegistry');
const {RegistryBase} = require('@pigalle/registries.base');


class ServicesRegistry extends RegistryBase {

  constructor(namespace = 'default', name, context, fns = []) {
    super('services-registry');
    LOG.debug(`Instantiating ServicesRegistry`, {namespace: namespace, name: name, context: context});
    this._namespace = namespace;
    this._name = name;
    this._context = context;
    this._fns = fns;
    this._services = new Map();
  }

  get services() {
    return this._services;
  }

  async init() {
    LOG.debug(`Initializing ServicesRegistry`);
    let setUpRetval = await this.setUp();
    this.registerAll();
    return this;
  }

  register(method, service) {
    LOG.debug(`Registering method`, {method: method, service: service});
    this._services.set(method, service);
    return this;
  }

  registerAll() {
    LOG.debug(`Register all methods of service: ${this._namespace}.${this._name}`);
    this._fns.forEach((method) => {
      this.register(method, this._context[method]);
    });
    return this;
  }

  get(method) {
    LOG.debug(`Get service ${this._namespace}.${this._name}.${method}`);
    return this._services.get(method);
  }

  async call(method, args = []) {
    LOG.debug(`Call service ${this._namespace}.${this._name}.${method}`);
    try {
      // let fn = this.get(method);
      let fn = this._services.get(method);
      let retval = await fn.apply(this._context, args);
      LOG.debug('retval', retval);
      return retval;
    } catch (e) {
      LOG.error(`Uncaught error when calling service ${this._namespace}.${this._name}.${method}`, e);
    }
  }

  getSetUpFn() {
    LOG.debug(`Lookup ${this._namespace}.${this._name} for setUp function`);
    if (this._context.setUp) {
      return this._context.setUp;
    } else {
      LOG.info(`setUp() function is not defined for ${this._namespace}.${this._name}`);
      return null;
    }
  }

  async setUp() {
    LOG.debug(`Call setUp function for ${this._namespace}.${this._name}`);
    if (this.getSetUpFn()) {
      LOG.debug('Context', this._context)
      let retval = await this.getSetUpFn().apply(this._context);
      return this;
    }
    return this;
  }

}

module.exports = {};
module.exports.ServicesRegistry = ServicesRegistry;

