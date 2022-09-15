require('dotenv').config();
var net = require("net");
var streamSet = require("stream-set");

var inputPort = process.argv[2];
var port = typeof inputPort !== 'undefined' ? inputPort : process.env.PORT;

var streams = streamSet();
var server = net.createServer(socket => {
    console.log("A client has connected");
    streams.forEach(otherSocket => {
        otherSocket.on("data", data => {
            socket.write(data);
        });

        socket.on("data", data => {
            otherSocket.write(data);
        });
    });
    streams.add(socket);
});

server.listen(port);
