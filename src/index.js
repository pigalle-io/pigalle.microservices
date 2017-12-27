
class TCPTransporter {
  constructor(port, address) {
    this.port = port || 1789;
    this.address = address || '127.0.0.1';
    this.clients = [];
  }

  start() {
    let server = this; // we'll use 'this' inside the callback below

    server.connection = net.createServer((socket) => {

      var buffer = Buffer.from('');

      console.log('new connection')
      //let client = new Client(socket);
      //console.log(`${client.name} connected.`);

      // Triggered on message received by this client
      socket.on('data', (data) => {

        buffer = Buffer.concat([buffer, Buffer.from(data)]);


        console.log('data received')
        if (_.endsWith(buffer.toString(), '\r\r')) {
          let m = JSON.parse(buffer);
          server.dispatch(m).then((response) => {
            socket.write(response.toString());
            socket.destroy();
          });
        }
        //console.log(`said: ${m}`);
        //socket.write(`We got your message (${m}). Thanks!\n`);

      });

      // Triggered when this client disconnects
      socket.on('end', () => {
        console.log('client ending')

        //console.log(`${client.name} disconnected.`);
      });
    });
    // starting the server
    this.connection.listen(this.port, this.address);
    // setuping the callback of the start function
    this.connection.on('listening', callback);
  }

}

module.exports = {
  TCPTransporter: TCPTransporter,
};
