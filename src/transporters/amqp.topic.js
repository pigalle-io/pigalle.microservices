const amqp = require('amqplib');
const net = require('net');
const process = require('process');

const Promise = require('bluebird');

const _ = require('lodash');
const isPromise = require('is-promise');

const LOG = require('../common/logger')('AmqpConsumerTopic');
const {TransporterBase} = require('./base');

const defaultOptions = {
  uri: 'amqp://localhost:5672',
  serializer: {
    module: '../serializers/json',
  },
};

class AmqpConsumerTopic extends TransporterBase {

  constructor(options = {}) {
    super('amqp', options);
    LOG.info('Instantiate AmqpTransporter');
    this._options = _.merge(defaultOptions, options);
    this.serializer = new (require(this._options.serializer.module))();
  }

  processRequest(buffer) {
    const request = buffer.toString();

    return new Promise((resolve, reject) => {
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
        reject(new Error('Unable to unserialize buffer ' + e));
      }
    });
  }

  dispatch(request) {
    return this._servicesRegistry.call(request.service, [request.payload.toString()]);
  }

  async start() {
    let retval = await this._servicesRegistry.setUp();
    LOG.info('Starting AmqpTransport');
    amqp.connect(this._options.uri).then((conn) => {
      process.once('SIGINT', () => {
        conn.close();
      });
      return conn.createChannel().then((ch) => {


        /*
        this._registry.forEach((value, key) => {
          LOG.info(`Create a consumer for service: ${key}`);
        });
        */

        let ex = 'topic_logs';
        let ok = ch.assertExchange(ex, 'topic', {durable: false});

        ok = ok.then(() => {
          return ch.assertQueue('', {exclusive: true});
        });

        ok = ok.then((qok) => {
          let queue = qok.queue;
          this._servicesRegistry.services.forEach((fn, rk) => {
            LOG.info('Try to register', {rk: rk, fn: fn,});
            ch.bindQueue(queue, ex, rk);
          });
          return queue;
        });

        ok = ok.then((queue) => {
          return ch.consume(queue, (msg) => {
            LOG.warn('Message received:', JSON.stringify(msg));
            const request = {service: msg.fields.routingKey, payload: msg.content};
            this.dispatch(request).then((response) => {
                LOG.debug(`Success when execute ${request.service}`, {response: response});
              })
              .catch((err) => {
                LOG.debug(`Failed to execute ${request.service}`, {error: err});
              })
          }, {noAck: false});
        });

        return ok.then(function() {
          LOG.info(' [*] Waiting for messages. To exit press CTRL+C.');
        });
      });
    }).catch(console.warn);
  }

}

module.exports = AmqpConsumerTopic;
