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

this.username = typeof inputUser !== 'undefined' ? inputUser : process.env.CHAT_USER;
var ip = process.env.IP;
var port = process.env.PORT;
var key = typeof inputKey !== 'undefined' ? inputKey : process.env.KEY;
this.maxHistory = typeof process.env.MAX_HISTORY !== 'undefined' ? process.env.MAX_HISTORY : 50;
this.messageDelimiter = typeof process.env.MESSAGE_DELIMITER !== 'undefined' ? process.env.MESSAGE_DELIMITER : " > ";
this.messageHistory = [];
this.messageHistorySelected = -1;
this.usernameFgColor = typeof process.env.USERNAME_FG_COLOR !== 'undefined' ? process.env.USERNAME_FG_COLOR : "blue";
this.messageDelimiterFgColor = typeof process.env.MESSAGE_DELIMITER_FG_COLOR !== 'undefined' ? process.env.MESSAGE_DELIMITER_FG_COLOR : "blue";
this.messageFgColor = typeof process.env.MESSAGE_FG_COLOR !== 'undefined' ? process.env.MESSAGE_FG_COLOR : "blue";

const colors = {
    fg: {
        blue: 34,
        yellow: 33,
        red: 31,
        cyan: 36,
        green: 32,
        magenta: 35,
        white: 37,
        gray: 30
    }
};

var socket = jsonStream(net.connect(port, ip));

//load commands from commands folder
var commands = [];
fs.readdirSync(__dirname + "/./commands").forEach(file => {
    if (file == 'Command.js') return;
    var command = require("./commands/" + file);
    commands.push(new command(this));
});

socket.on("data", data => {
    var decipher = crypto.createDecipher("aes256", key);

    try {
        var decrypted = decipher.update(data.message, 'hex', 'utf8') + decipher.final('utf8');
    } catch (e) {
        var decrypted = data.message;
    }

    // var userMessage = `${data.username}${this.messageDelimiter}${decrypted}`;
    this.drawMessage(this.generateColoredMessage(data.username, this.messageDelimiter, decrypted));
    this.drawInput();
    if (decrypted.includes("!")) {
        notifySend.notify(data.username, decrypted);
    }
});

//Standardize line drawing because of the custom input handler
this.drawLine = function (line) {
    process.stdout.cursorTo(0);
    process.stdout.write(line);
    process.stdout.cursorTo(input.length);
};

//Draw a message in the chat view
this.drawMessage = function (message) {
    this.drawLine(message.padEnd(inputMaxLength, ' ') + `\n`);
};

//Draw the input on the last line
this.drawInput = function () {
    this.drawLine(input.padEnd(inputMaxLength, ' ') + "\r");
};

var input = "";
var inputMaxLength = 0;
process.stdin.on("keypress", (char, evt) => {
    if ((evt.name === 'c' || evt.name === 'd') && evt.ctrl === true) {
        process.exit();
    } else if (evt.name === 'return') {
        this.drawMessage(this.generateColoredMessage(this.username, this.messageDelimiter, input));
        this.processInput(this);
        this.messageHistorySelected = -1;
    } else if (evt.name === 'backspace') {
        input = input.substring(0, input.length - 1);
    } else if (evt.ctrl === true && evt.name === "w") {
        this.removeLastWord();
    } else if (evt.ctrl === true && evt.name === "u") {
        input = "";
    } else if (evt.ctrl === true && evt.name === "l") {
        console.clear();
    } else if (evt.name === "left" || evt.name === "right") {
        return;
    } else if (evt.name === "up") {
        this.messageHistoryUp();
    } else if (evt.name === "down") {
        this.messageHistoryDown();
    } else {
        input += evt.sequence;
    }

    inputMaxLength = Math.max(inputMaxLength, input.length);
    this.drawInput();
});

this.getColorValue = function (type, color) {
    let defaultFg = 31;

    switch (type) {
        case "fg":
        default:
            if (typeof colors.fg[color] === 'undefined') {
                return defaultFg;
            }
            return colors.fg[color];
            break;
    }
}

this.generateColoredMessage = function (username, delimiter, message) {
    let usernameFgColor = this.getColorValue("fg", this.usernameFgColor);
    let delimiterFgColor = this.getColorValue("fg", this.messageDelimiterFgColor);
    let messageFgColor = this.getColorValue("fg", this.messageFgColor);

    return "\x1b[" + usernameFgColor + "m" + username + "\x1b[89m"
        + "\x1b[" + delimiterFgColor + "m" + delimiter + "\x1b[89m"
        + "\x1b[" + messageFgColor + "m" + message + "\x1b[89m"
        + "\x1b[0m";
}

this.messageHistoryUp = function () {
    if (this.messageHistorySelected === 0 || this.messageHistory.length === 0) {
        return;
    }

    if (this.messageHistorySelected === -1) {
        this.messageHistorySelected = this.messageHistory.length - 1;
    } else {
        this.messageHistorySelected--;
    }
    input = this.messageHistory[this.messageHistorySelected];
}

this.messageHistoryDown = function () {
    if (this.messageHistorySelected === this.messageHistory.length) {
        return;
    }

    this.messageHistorySelected++;
    if (this.messageHistorySelected === this.messageHistory.length) {
        input = "";
    } else {
        input = this.messageHistory[this.messageHistorySelected];
    }
}

this.messageHistoryAdd = function (message) {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistory) {
        this.messageHistory.shift();
    }
}

this.processInput = function (client) {
    let msg = input.trim();
    this.messageHistoryAdd(msg);
    input = "";

    //Handle client commands
    if (msg.startsWith("/")) {
        //Find command with name
        let regExp = /[^\s"]+|"([^"]*)"/gi;
        let msgParts = [];
        do {
            var match = regExp.exec(msg);
            if (match != null) {
                msgParts.push(match[1] ? match[1] : match[0]);
            }
        } while (match != null);
        let command = commands.find(c => c.name === msgParts[0].substring(1));
        if (command) {
            msgParts.splice(0, 1);
            command.execute(msgParts);
            return;
        }
    }

    var cipher = crypto.createCipher("aes256", key);
    var encrypted = cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');

    var username = client.username;
    socket.write({username, message: encrypted});
};

this.removeLastWord = function () {
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
};