
const {Microservice} = require('../src/microservice');


class FakeService extends Microservice {
  constructor() {
    super('fake-service');
  }

  sum(args) {
    return args.x + args.y;
  }
}

const f = new FakeService();
f.expose().registerAll().start();
