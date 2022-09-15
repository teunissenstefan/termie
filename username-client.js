var net = require("net");
var jsonStream = require("duplex-json-stream");
var username = process.argv[2];
var key = process.argv[3];
var notifySend = require("notify-send");
var crypto = require('crypto');

var socket = jsonStream(net.connect(42069, "127.0.0.1"));

socket.on("data", data => {
  var decipher = crypto.createDecipher("aes256", key);
  var decrypted = decipher.update(data.message, 'hex', 'utf8') + decipher.final('utf8');
  console.log(`${data.username} > ${decrypted}`);
  if(decrypted.includes("!")){
    notifySend.notify(data.username, decrypted);
  }
});

process.stdin.on("data", data => {
  var cipher = crypto.createCipher("aes256", key);
  var encrypted = cipher.update(data.toString().trim(), 'utf8', 'hex') + cipher.final('hex');
  socket.write({ username, message: encrypted });
});
