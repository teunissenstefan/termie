require('dotenv').config();
var net = require("net");
var jsonStream = require("duplex-json-stream");
var notifySend = require("notify-send");
var crypto = require('crypto');

var inputKey = process.argv[2];
var inputUser = process.argv[3];

var username = typeof inputUser !== 'undefined' ? inputUser : process.env.USERNAME;
var ip = process.env.IP;
var port = process.env.PORT;
var key = typeof inputKey !== 'undefined' ? inputKey : process.env.KEY;

var socket = jsonStream(net.connect(port, ip));

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
