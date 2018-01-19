const bunyan = require('bunyan');

let MAIN_LOG = bunyan.createLogger({name: 'pigalle.microservices', level: 'DEBUG'});

module.exports = (name) => {
  return MAIN_LOG.child({widget_type: name});
}

