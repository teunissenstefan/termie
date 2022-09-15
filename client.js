//Disable all warnings because we are cool
process.removeAllListeners('warning');
process.stdin.setRawMode(true);

require('dotenv').config();
var readline = require("readline");
readline.emitKeypressEvents(process.stdin);
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
var messageDelimiter = typeof process.env.MESSAGE_DELIMITER !== 'undefined' ? process.env.MESSAGE_DELIMITER : " > ";

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

    try {
        var decrypted = decipher.update(data.message, 'hex', 'utf8') + decipher.final('utf8');
    } catch (e) {
        var decrypted = data.message;
    }

    var userMessage = `${data.username}${messageDelimiter}${decrypted}`;
    drawMessage(userMessage);
    drawInput();
    if (decrypted.includes("!")) {
        notifySend.notify(data.username, decrypted);
    }
});

//Standardize line drawing because of the custom input handler
function drawLine(line) {
    process.stdout.cursorTo(0);
    process.stdout.write(line);
    process.stdout.cursorTo(input.length);
}

//Draw a message in the chat view
function drawMessage(message) {
    drawLine(message.padEnd(inputMaxLength, ' ') + `\n`);
}

//Draw the input on the last line
function drawInput() {
    drawLine(input.padEnd(inputMaxLength, ' ') + "\r");
}

var input = "";
var inputMaxLength = 0;
process.stdin.on("keypress", (char, evt) => {
    // console.log("Char:", JSON.stringify(char), "Evt:", JSON.stringify(evt)); //for testing

    if (
        (
            evt.name === 'c' || evt.name === 'd'
        )
        && evt.ctrl === true) {
        process.exit();
    } else if (evt.name === 'return') {
        drawMessage(username + messageDelimiter + input);
        processInput();
    } else if (evt.name === 'backspace') {
        input = input.substring(0, input.length - 1);
    } else if (evt.ctrl === true && evt.name === "w") {
        removeLastWord();
    } else if (evt.ctrl === true && evt.name === "u") {
        input = "";
    }  else if (evt.ctrl === true && evt.name === "l") {
        console.clear();
    } else {
        input += evt.sequence;
    }

    inputMaxLength = Math.max(inputMaxLength, input.length);
    drawInput();
});

function processInput() {
    let msg = input.trim();
    input = "";

    //handle client commands
    if (msg.startsWith("/")) {
        //find command with name
        let command = commands.find(c => c.name === msg.split(" ")[0].substring(1));
        if (command) {
            command.execute(msg, socket, username);
            return;
        }
    }

    var cipher = crypto.createCipher("aes256", key);
    var encrypted = cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
    socket.write({username, message: encrypted});
}

function removeLastWord() {
    var words = input.split(" ").reverse();
    var count = 0;
    for (var i = 0; i < words.length; i++) {
        count++;
        var word = words[i];
        if (!word) continue;

        break;//A word has been found so there's nothing more for us to delete
    }
    words.splice(0, count);
    input = words.reverse().join(" ");
}