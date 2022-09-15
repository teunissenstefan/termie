require('dotenv').config();
var net = require("net");
var jsonStream = require("duplex-json-stream");
var notifySend = require("notify-send");
var crypto = require('crypto');
var fs = require('fs');

var inputKey = process.argv[2];
var inputUser = process.argv[3];

var username = typeof inputUser !== 'undefined' ? inputUser : process.env.CHAT_USER;
var ip = process.env.IP;
var port = process.env.PORT;
var key = typeof inputKey !== 'undefined' ? inputKey : process.env.KEY;

var socket = jsonStream(net.connect(port, ip));

//load commands from commands folder
var commands = [];
fs.readdirSync(__dirname + "/./commands").forEach(file => {
    if (file == 'Command.js') return;
    var command = require("./commands/" + file);
    commands.push(new command());
});


socket.on("data", data => {
  var decipher = crypto.createDecipher("aes256", key);
  var decrypted = decipher.update(data.message, 'hex', 'utf8') + decipher.final('utf8');
  console.log(`${data.username} > ${decrypted}`);
  if(decrypted.includes("!")){
    notifySend.notify(data.username, decrypted);
  }
});

process.stdin.on("data", data => {
    let msg = data.toString().trim();

    //handle client commands
    if(msg.startsWith("/")) {
        //find command with name
        let command = commands.find(c => c.name == msg.split(" ")[0].substring(1));
        if(command) {
            command.execute(msg, socket, username);
        }

        return;
    }

  var cipher = crypto.createCipher("aes256", key);
  var encrypted = cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
  socket.write({ username, message: encrypted });
});
