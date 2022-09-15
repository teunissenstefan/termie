const Command = require('./Command');

module.exports = class ChangeDelimiterCommand extends Command {
    constructor(client) {
        super(client, 'changedelimiter', 'Change message delimiter');
    }

    execute(argv) {
        if (argv.length < 1) {
            this.client.drawLine("Not enough arguments\n");
            return;
        }

        let newDelimiter = argv[0];
        this.client.messageDelimiter = newDelimiter;
        this.client.drawLine("Delimiter has been changed to: " + newDelimiter + "\n");
    }
};