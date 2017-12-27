
const {Microservice} = require('../src/microservice');


class FakeService extends Microservice {
  constructor() {
    super('fake-service');
  }

  sum(x, y) {
    return new Promise((resolve) => {
      resolve(x+y);
    })
  }
}

const f = new FakeService();
f.expose().start();
