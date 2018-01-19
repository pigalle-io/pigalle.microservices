
const {PigalleBaseClass} = require('@pigalle/core.base.class');

class PigalleMicroserviceBaseClass extends PigalleBaseClass {

  constructor() {
    super();
    this.$pigalle = {
      extension: {
        name: 'pigalle.microservices',
        display: 'microservices',
      },
    };
  }

}

module.exports = {
  PigalleMicroserviceBaseClass: PigalleMicroserviceBaseClass,
}
