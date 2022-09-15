const Command = require('./Command');

module.exports = class ChangeUsernameCommand extends Command {
    constructor(client) {
        super(client, 'changeusername', 'Change username');
    }

    execute(argv) {
        if (argv.length < 1) {
            this.client.drawLine("Not enough arguments\n");
            return;
        }

        let newUsername = argv[0];
        this.client.username = newUsername;
        this.client.drawLine("Username has been changed to: " + newUsername + "\n");
    }
};