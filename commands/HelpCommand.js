const Command = require('./Command');
const fs = require('fs');

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, 'help', 'Displays a list of commands');
        this.commands = [];
        this.loadCommands();
    }

    loadCommands() {
        //load commands from commands folder
        fs.readdirSync(__dirname + "/../commands").forEach(file => {
            if (file == 'Command.js') return;
            if (file == 'HelpCommand.js') return;
            var command = require(__dirname + "/../commands/" + file);
            this.commands.push(new command(this.client));
        });
    }

    execute(argv) {
        //loop over commands
        this.client.drawLine(" -- Commands -- \n");
        this.client.drawLine("List of available commands\n");

        this.commands.forEach(command => {
            this.client.drawLine(`- /${command.name} - ${command.description}\n`);
        });
    }
};