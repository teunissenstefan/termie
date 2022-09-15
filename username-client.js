var net = require("net");
var jsonStream = require("duplex-json-stream");
var username = process.argv[2];
var notifySend = require("notify-send");

var socket = jsonStream(net.connect(42069, "127.0.0.1"));

socket.on("data", data => {
  console.log(`${data.username} > ${data.message}`);
  notifySend.notify(data.username, data.message);
});

process.stdin.on("data", data => {
  socket.write({ username, message: data.toString().trim() });
});
