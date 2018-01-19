const net = require('net');

const Promise = require('bluebird');

const _ = require('lodash');
const isPromise = require('is-promise');

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
    super('tcp', options);
    this._options = _.merge(defaultOptions, options);
    this.address = this._options.address || '127.0.0.1';
    this.port = this._options.port || 1789;
    this.serializer = new (require(this._options.serializer.module))();
  }

  processRequest(buffer) {
    const request = buffer.toString();

    return new Promise((resolve, reject) => {
      try {

        const data = this.serializer.unserialize(request);
        console.log(data)
        if (!data.service) {
          reject(new Error('Service attribute is missing into the request'));
        } else {
          const service = data.service;
          delete(data.service);
          const payload = data.payload || {};
          resolve({service: service, payload: payload});
        }
      } catch (e) {
        reject(new Error('Unable to unserialize buffer ' + e));
      }
    });
  }

  dispatch(request) {
    return new Promise((resolve, reject) => {
      const service = this._registry.get(request.service);
      if (!service) {
        reject(new Error(`Service ${service} not found in registry`));
      } else {
        const response = service(request.payload);
        if (isPromise(response) === false) {
          resolve(response);
        } else {
          return response.then(resolve).catch(reject);
        }
      }
    });
  }


  start() {
    this.connection = net.createServer((socket) => {
      let buffer = Buffer.from('');
      socket.on('data', (data) => {
        buffer = Buffer.concat([buffer, Buffer.from(data)]);
        if (buffer.includes(CHAR_EOT) === true) {
          buffer = buffer.slice(0, buffer.indexOf(CHAR_EOT));


          this.processRequest(buffer)
            .then((request) => {
              return this.dispatch(request);
            })
            .then((response) => {
              socket.write(response.toString());
              socket.end();
            }).catch((err) => {
            //throw new Error(err);
            socket.write(err.toString());
            socket.write(err.stack);
            socket.destroy();
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
