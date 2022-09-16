const Command = require('./Command');

module.exports = class HistoryCommand extends Command {
    constructor(client) {
        super(client, 'history', 'Manage history');
    }

    execute(argv) {
        if (argv.length < 1) {
            this.client.drawLine("Not enough arguments\n");
            this.client.drawLine(" /history show - show history\n");
            this.client.drawLine(" /history clear - clear history\n");
            return;
        }

        let cmd = argv[0];
        switch (cmd) {
            case "show":
                this.showHistory();
                break;
            case "clear":
                this.clearHistory();
                break;
            default:
                this.client.drawLine("Invalid argument '" + cmd + "'\n");
        }
    }

    clearHistory() {
        this.client.messageHistory = [];
        this.client.drawLine("Message history has been cleared" + "\n");
    }

    showHistory() {
        this.client.drawLine("Message history:" + "\n");
        for (let i = 0; i < this.client.messageHistory.length; i++) {
            this.client.drawLine(this.client.messageHistory[i] + "\n");
        }
    }
};