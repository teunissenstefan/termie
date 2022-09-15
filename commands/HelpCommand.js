const Command = require('./Command');
const fs = require('fs');

module.exports = class HelpCommand extends Command {
    constructor() {
        super('help', 'Displays a list of commands');
        this.commands = [];
        this.loadCommands();
    }

    loadCommands(){
        //load commands from commands folder
        fs.readdirSync(__dirname + "/../commands").forEach(file => {
            if (file == 'Command.js') return;
            if (file == 'HelpCommand.js') return;
            var command = require(__dirname + "/../commands/" + file);
            this.commands.push(new command());
        });
    }

    execute() {
        //loop over commands
        console.log(" -- Commands -- ");
        console.log("List of available commands:");

        this.commands.forEach(command => {
            console.log(`- /${command.name} - ${command.description}`);
        });
    }
};