const Command = require('./Command');

module.exports = class HelpCommand extends Command {
    constructor() {
        super('help', 'Displays a list of commands');
    }

    execute() {
        console.log("-- Help --");
        console.log("Help command executed");
    }
};