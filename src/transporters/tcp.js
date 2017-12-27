
const net = require('net');

const _ = require('lodash');

const {TransporterBase} = require('./base');

const defaultOptions = {
  address: '127.0.0.1',
  port: 1789,
  serializer: {
    module: '../serializers/json',
  },
};

const CHAR_EOT = '\u0004';

class TcpTransporter extends TransporterBase {

  constructor(options = {}) {
    super('tcp');
    this._options = _.merge(defaultOptions, options);
    console.log(this._options);
    this.address = this._options.address || '127.0.0.1';
    this.port = this._options.port || 1789;
    this.serializer = new (require(this._options.serializer.module))();
    this._registry = new Map();
  }

  register(service) {
    this._registry.set(service.name, service);
    return this;
  }


  processRequest(buffer) {
    const request = buffer.toString();

    return new Promise((resolve, reject) => {
      console.log(buffer);
      try {
        const data = this.serializer.unserialize(request);
        if (!data.service) {
          reject(new Error('Service attribute is missing into the request'));
        } else {
          const service = data.service;
          delete(data.service);
          const payload = data.payload || {};
          resolve({service: service, payload: payload});
        }
      } catch (e) {
        reject(new Error('Unable to unserialize buffer'));
      }
    });
  }

  dispatch() {
    return (request) => {
      return new Promise((resolve, reject) => {
        const service = this._registry.get(request.service);
        if (!service) {
          reject(new Error(`Service ${service} not found in registry`));
        } else {
          if (!request.method) {
            reject(new Error(`Missing method: ${request.method}`));
          }
          if (!service.hasOwnProperty(request.method)) {
            reject(new Error(`Service provides not method ${request.method}`));
          }
          const fn = service[request.method];
          return fn.call(null, request.payload);
        }
      });
    }
  }


  start() {
    this.connection = net.createServer((socket) => {
      let buffer = Buffer.from('');
      socket.on('data', (data) => {
        buffer = Buffer.concat([buffer, Buffer.from(data)]);
        console.log(buffer)

        if (buffer.includes(CHAR_EOT) === true) {
          buffer = buffer.slice(0, buffer.indexOf(CHAR_EOT));



          this.processRequest(buffer)
            .then(this.dispatch.bind(this))
            .then((response) => {
            socket.write(response.toString());
            socket.destroy();
          }).catch((err) => {
            throw new Error(err);
          });
        }
      });

      // Triggered when this client disconnects
      socket.on('end', () => {
        console.log('client ending')
      });
    });
    // starting the server
    this.connection.listen(this.port, this.address);
    // setuping the callback of the start function
    this.connection.on('listening', () => {

    });
  }

}

module.exports = TcpTransporter;
