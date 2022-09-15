const Command = require('./Command');

module.exports = class ClearCommand extends Command {
    constructor() {
        super('clear', 'Clear messages');
    }

    execute() {
        console.clear();
    }
};