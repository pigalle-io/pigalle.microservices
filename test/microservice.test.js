
const {Microservice} = require('../src/microservice');


class FakeService extends Microservice {
  constructor() {
    super();
  }

  sum(args) {
    return args.x + args.y;
  }
}

FakeService.factory().expose().registerAll().start();
