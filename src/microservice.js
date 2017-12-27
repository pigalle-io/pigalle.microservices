
const _ = require('lodash');
const uuid = require('uuid');

const {PigalleMicroserviceBaseClass} = require('./common/base');


const defaultsOpts = {
  transporter: {
    module: './transporters/tcp',
    options: {

    }
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
        props.indexOf(p) === -1          //not overridden in a child
      )
    props = props.concat(l)
  }
  while (
    (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
    Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
    )

  return props
}


class Microservice extends PigalleMicroserviceBaseClass {

  constructor(name, options) {
    super();
    this.name = name || uuid.v4();
    this._options = options || defaultsOpts;
  }

  expose(extension) {
    extension = extension || this._options.transporter.module;
    const Clazz = require(extension);
    this._transporter = new Clazz(this._options.transporter.options);
    return this;
  }

  start() {
    if (!this._transporter) {
      throw new Error('Invalid transporter');
    }
    this._transporter.start();
  }

  register(service, fn) {
    this._transporter.register(service, fn);
    return this;
  }

  registerAll() {

    const fns = _.differenceWith(getAllMethods(this), getAllMethods(Microservice.prototype))
    console.log(fns)

    fns.forEach((method) => {
      this.register(`${this.name}.${method}`, this[method]);
    });

    return this;
  }

}

module.exports = {
  Microservice: Microservice,
}
